const { printOptions } = require('./utils/config');
const { getV4IconComponentName } = require('./utils/icon');
const {
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

  let localComponentName = 'Icon';

  function rewriteToV4DefaultIcon(j, root, localComponentName) {
    // add @ant-design/icons imports
    addModuleDefaultImport(j, root, '@ant-design/icons', localComponentName);
  }

  function rewriteToCompatibleIcon(j, root, localComponentName, jsxElement) {
    // rename name to `LegacyIcon`
    jsxElement.openingElement.name.name = 'LegacyIcon';
    if (jsxElement.closingElement) {
      jsxElement.closingElement.name.name = 'LegacyIcon';
    }
    // add @ant-design/compatible imports
    addSubmoduleImport(j, root, '@ant-design/compatible', 'Icon', 'LegacyIcon');
  }

  function rewriteToSepcificV4Icon(j, root, localComponentName, jsxElement) {
    const node = jsxElement.openingElement;
    const typeAttr = node.attributes.find(attr => attr.name.name === 'type');
    const themeAttr = node.attributes.find(attr => attr.name.name === 'theme');

    const v4IconComponentName = getV4IconComponentName(
      typeAttr.value.value,
      // props#theme can be empty
      themeAttr && themeAttr.value.value,
    );

    if (v4IconComponentName) {
      node.name.name = v4IconComponentName;
      if (jsxElement.closingElement) {
        jsxElement.closingElement.name.name = v4IconComponentName;
      }

      // remove props `type` and `theme`
      node.attributes = node.attributes.filter(
        attr => !['theme', 'type'].includes(attr.name.name),
      );
      // add a new import for v4 icon component
      addSubmoduleImport(j, root, '@ant-design/icons', v4IconComponentName);
      hasChanged = true;
    }
  }

  function rewriteOldIconImport(j, root, localComponentName) {
    // 1. 找到符合条件的改写为 import Icon from '@ant-design/icons'
    //    条件为 children 属性为 不为空 或者 component 属性不为空
    // 2. 找到符合条件的改写为 import { SpecificIcon } from '@ant-design/icons'
    //    条件为 type 属性为 string, 且 theme 属性为 string
    // 不符合的统一改写为 import { Icon as LegacyIcon } '@ant-design/compatible'
    root.findJSXElements(localComponentName).forEach(nodePath => {
      const jsxElement = nodePath.node;
      if (
        iconContainValidChildren(jsxElement) ||
        iconContainValidComponentProp(jsxElement)
      ) {
        rewriteToV4DefaultIcon(j, root, localComponentName);
        return;
      }

      if (iconContainLiteralTypeAndThemeProp(jsxElement)) {
        rewriteToSepcificV4Icon(j, root, localComponentName, jsxElement);
        return;
      }

      rewriteToCompatibleIcon(j, root, localComponentName, jsxElement);
    });
  }

  // remove old Icon imports from antd
  function removeAntdIconImport(j, root) {
    let hasChanged = false;

    // import { Icon } from 'antd';
    // import { Icon as AntdIcon } from 'antd';
    root
      .find(j.Identifier)
      .filter(
        path =>
          path.node.name === 'Icon' &&
          path.parent.node.type === 'ImportSpecifier' &&
          path.parent.parent.node.source.value === 'antd',
      )
      .forEach(path => {
        hasChanged = true;
        localComponentName = path.parent.node.local.name;

        const importDeclaration = path.parent.parent.node;
        // remove old imports
        importDeclaration.specifiers = importDeclaration.specifiers.filter(
          specifier =>
            !specifier.imported || specifier.imported.name !== 'Icon',
        );

        rewriteOldIconImport(j, root, localComponentName);
      });

    return hasChanged;
  }

  // rewrite v3 Icon static methods
  function rewriteAntdStaticIconMethods(j, root) {
    let hasChanged = false;
    const staticMethodCallExpressions = root
      .find(j.CallExpression, {
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'Identifier',
            name: 'Icon',
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
      addSubmoduleImport(j, root, '@ant-design/icons', staticMethod);
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
  hasChanged = rewriteAntdStaticIconMethods(j, root) || hasChanged;

  if (hasChanged) {
    removeEmptyModuleImport(j, root, 'antd');
  }

  return hasChanged
    ? root.toSource(options.printOptions || printOptions)
    : null;
};
