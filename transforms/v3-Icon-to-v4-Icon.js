const { addIconRelatedMsg } = require('./utils/summary');
const { markDependency } = require('./utils/marker');
const { printOptions } = require('./utils/config');
const { getV4IconComponentName } = require('./utils/icon');
const {
  parseStrToArray,
  removeEmptyModuleImport,
  addSubmoduleImport,
  addModuleDefaultImport,
} = require('./utils');

const v3IconStaticMethods = [
  'createFromIconfontCN',
  'getTwoToneColor',
  'setTwoToneColor',
];

// filter for Icon#props contains `children`
function iconContainValidChildren(jsxElement) {
  return Array.isArray(jsxElement.children) && jsxElement.children.length > 0;
}

// filter for Icon#props contains `component`
function iconContainValidComponentProp(jsxElement) {
  const node = jsxElement.openingElement;
  return (
    node.attributes.filter(
      n =>
        n.type === 'JSXAttribute' &&
        n.name.type === 'JSXIdentifier' &&
        n.name.name === 'component',
    ).length === 1
  );
}

// filter for Icon#props contain a Literal `type` prop with a Literal or default `theme` prop
function iconContainLiteralTypeAndThemeProp(jsxElement) {
  const node = jsxElement.openingElement;
  // Icon#prop `type` is Literal
  const propTypeIsString =
    node.attributes.filter(
      n =>
        n.type === 'JSXAttribute' &&
        n.name.type === 'JSXIdentifier' &&
        n.name.name === 'type' &&
        n.value.type === 'StringLiteral',
    ).length === 1;
  // Icon#prop `theme` is Literal or default
  const propThemeIsStringOrDefault =
    node.attributes.filter(
      n =>
        n.type === 'JSXAttribute' &&
        n.name.type === 'JSXIdentifier' &&
        n.name.name === 'theme' &&
        n.value.type === 'StringLiteral',
    ).length === 1 ||
    node.attributes.filter(
      n =>
        n.type === 'JSXAttribute' &&
        n.name.type === 'JSXIdentifier' &&
        n.name.name === 'theme',
    ).length === 0;

  return propTypeIsString && propThemeIsStringOrDefault;
}

module.exports = (file, api, options) => {
  const j = api.jscodeshift;
  const root = j(file.source);
  const antdPkgNames = parseStrToArray(options.antdPkgNames || 'antd');

  function rewriteToV4DefaultIcon(j, root, { localName, before }) {
    // add @ant-design/icons imports
    addModuleDefaultImport(j, root, {
      moduleName: '@ant-design/icons',
      localName,
      before,
    });
    return true;
  }

  function rewriteToCompatibleIcon(j, root, { jsxElement, before }) {
    // rename name to `LegacyIcon`
    jsxElement.openingElement.name.name = 'LegacyIcon';
    if (jsxElement.closingElement) {
      jsxElement.closingElement.name.name = 'LegacyIcon';
    }
    // add @ant-design/compatible imports
    addSubmoduleImport(j, root, {
      moduleName: '@ant-design/compatible',
      importedName: 'Icon',
      localName: 'LegacyIcon',
      before,
    });
    markDependency('@ant-design/compatible');
  }

  function rewriteToSepcificV4Icon(j, root, { jsxElement, before }) {
    const node = jsxElement.openingElement;
    const typeAttr = node.attributes.find(attr => attr.name.name === 'type');
    const themeAttr = node.attributes.find(attr => attr.name.name === 'theme');

    const v4IconComponentName = getV4IconComponentName(
      typeAttr.value.value,
      // props#theme can be empty
      themeAttr && themeAttr.value.value,
    );

    if (!v4IconComponentName) {
      const location = jsxElement.loc.start;
      addIconRelatedMsg(file, location, j(jsxElement).toSource());
      return false;
    }

    node.name.name = v4IconComponentName;
    if (jsxElement.closingElement) {
      jsxElement.closingElement.name.name = v4IconComponentName;
    }

    // remove props `type` and `theme`
    node.attributes = node.attributes.filter(
      attr => !['theme', 'type'].includes(attr.name.name),
    );
    // add a new import for v4 icon component
    addSubmoduleImport(j, root, {
      moduleName: '@ant-design/icons',
      importedName: v4IconComponentName,
      before,
    });
    markDependency('@ant-design/icons');
    return true;
  }

  function rewriteOldIconImport(j, root, { localName, before }) {
    // 1. 找到符合条件的改写为 import Icon from '@ant-design/icons'
    //    条件为 children 属性为 不为空 或者 component 属性不为空
    // 2. 找到符合条件的改写为 import { SpecificIcon } from '@ant-design/icons'
    //    条件为 type 属性为 string, 且 theme 属性为 string
    // 不符合的统一改写为 import { Icon as LegacyIcon } '@ant-design/compatible'
    root.findJSXElements(localName).forEach(nodePath => {
      const jsxElement = nodePath.node;
      if (
        iconContainValidChildren(jsxElement) ||
        iconContainValidComponentProp(jsxElement)
      ) {
        if (rewriteToV4DefaultIcon(j, root, { localName, before })) {
          return;
        }
      }

      if (iconContainLiteralTypeAndThemeProp(jsxElement)) {
        if (
          rewriteToSepcificV4Icon(j, root, { localName, jsxElement, before })
        ) {
          return;
        }
      }

      rewriteToCompatibleIcon(j, root, { localName, jsxElement, before });
    });
  }

  // remove old Icon imports from antd
  function removeAntdIconImport(j, root) {
    let hasChanged = false;

    // import { Icon } from 'antd';
    // import { Icon as AntdIcon } from 'antd';
    // import { Icon } from '@forked/antd';
    root
      .find(j.Identifier)
      .filter(
        path =>
          path.node.name === 'Icon' &&
          path.parent.node.type === 'ImportSpecifier' &&
          antdPkgNames.includes(path.parent.parent.node.source.value),
      )
      .forEach(path => {
        hasChanged = true;
        const localComponentName = path.parent.node.local.name;
        const antdPkgName = path.parent.parent.node.source.value;

        const importDeclaration = path.parent.parent.node;
        // remove old imports
        importDeclaration.specifiers = importDeclaration.specifiers.filter(
          specifier =>
            !specifier.imported || specifier.imported.name !== 'Icon',
        );

        rewriteOldIconImport(j, root, {
          localName: localComponentName,
          before: antdPkgName,
        });
        rewriteAntdStaticIconMethods(j, root, {
          localName: localComponentName,
          before: antdPkgName,
        });
      });

    return hasChanged;
  }

  // rewrite v3 Icon static methods
  function rewriteAntdStaticIconMethods(j, root, { localName, before }) {
    let hasChanged = false;
    const staticMethodCallExpressions = root
      .find(j.CallExpression, {
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'Identifier',
            name: localName,
          },
          property: {
            type: 'Identifier',
          },
        },
      })
      .find(j.MemberExpression)
      .filter(({ node }) => v3IconStaticMethods.includes(node.property.name));

    staticMethodCallExpressions.forEach(({ node }) => {
      const staticMethod = node.property.name;
      addSubmoduleImport(j, root, {
        moduleName: '@ant-design/icons',
        importedName: staticMethod,
        before,
      });
      markDependency('@ant-design/icons');
    });

    staticMethodCallExpressions.forEach(nodePath => {
      const staticMethod = nodePath.node.property.name;
      j(nodePath).replaceWith(() => j.identifier(staticMethod));
      hasChanged = true;
    });

    return hasChanged;
  }

  // step1. remove Icon import from antd
  // step2. determine whether use @ant-design/icons or @ant-design/compatible
  // step3.1 add Icon import from @ant-design/compatible
  // step3.2 add specific icon component import from @ant-design/icons
  // step4. cleanup antd import if empty
  let hasChanged = false;
  hasChanged = removeAntdIconImport(j, root) || hasChanged;

  if (hasChanged) {
    antdPkgNames.forEach(antdPkgName => {
      removeEmptyModuleImport(j, root, antdPkgName);
    });
  }

  return hasChanged
    ? root.toSource(options.printOptions || printOptions)
    : null;
};
