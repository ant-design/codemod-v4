const {
  withThemeSuffix,
  removeTypeTheme,
  alias,
} = require('@ant-design/compatible/lib/icon/utils');
const allIcons = require('@ant-design/icons/lib/icons');

const { printOptions } = require('./utils/config');
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

module.exports = (file, api, options) => {
  const j = api.jscodeshift;
  const root = j(file.source);

  let localComponentName = 'Icon';

  function rewriteOldIconWithImport(j, root) {
    let hasChanged = false;
    // 找到符合条件的 Icon components 通过 '@ant-design/icons' 引入
    // 条件为 type 属性为 string, 且 theme 属性为 string
    // 不符合的一概通过 '@ant-design/compatible' 引入
    const existedIconComponents = root.findJSXElements(localComponentName);

    const targetIconComponents = existedIconComponents
      .find(j.JSXAttribute, {
        name: {
          type: 'JSXIdentifier',
          name: 'type',
        },
        value: {
          type: 'Literal',
        },
      })
      .filter(nodePath => {
        const iconComponent = nodePath.parent.node;
        const themeAttr = iconComponent.attributes.filter(
          attr => attr.name.name === 'theme',
        )[0];

        return !themeAttr || (themeAttr && themeAttr.value.type === 'Literal');
      });

    if (existedIconComponents.size() > targetIconComponents.size()) {
      const hasComponentPropIcon = existedIconComponents.find(j.JSXAttribute, {
        name: {
          type: 'JSXIdentifier',
          name: 'component',
        },
      });
      const hasChildrenPropIcon = existedIconComponents.filter(
        nodePath =>
          Array.isArray(nodePath.node.children) &&
          nodePath.node.children.length,
      );

      // when props#component or props#children
      // use Icon from '@ant-design/icons'
      if (hasComponentPropIcon.length > 0 || hasChildrenPropIcon > 0) {
        // add @ant-design/compatible imports
        addModuleDefaultImport(j, root, '@ant-design/icons', 'Icon');
        hasChanged = true;
      }

      const unconvertableIconComponents = existedIconComponents
        .filter(
          nodePath => !nodePath.node.children || !nodePath.node.children.length,
        )
        .filter(nodePath => {
          return (
            j(nodePath)
              .find(j.JSXAttribute, {
                name: {
                  type: 'JSXIdentifier',
                  name: 'component',
                },
              })
              .size() === 0
          );
        });

      if (unconvertableIconComponents.size() > 0) {
        if (localComponentName !== 'Icon') {
          // add @ant-design/compatible imports
          addSubmoduleImport(
            j,
            root,
            '@ant-design/compatible',
            'Icon',
            localComponentName,
          );
          hasChanged = true;
        }
        // 需要将符合条件的 Icon 转换成 LegacyIcon 引用
        unconvertableIconComponents
          .find(j.JSXAttribute, {
            name: {
              type: 'JSXIdentifier',
              name: 'type',
            },
          })
          .filter(nodePath => {
            // props#type is not a string
            if (nodePath.value.value.type !== 'Literal') {
              return true;
            }

            const iconComponent = nodePath.parent.node;
            const themeAttr = iconComponent.attributes.filter(
              attr => attr.name.name === 'theme',
            )[0];
            // has no props#theme
            if (!themeAttr) {
              return true;
            }

            // props#theme is not a string
            if (themeAttr && themeAttr.value.type !== 'Literal') {
              return true;
            }
          })
          .forEach(nodePath => {
            // rename iconComponent name to LegacyIcon
            const iconComponent = nodePath.parent.node;
            iconComponent.name.name = 'LegacyIcon';
            // add @ant-design/compatible imports
            addSubmoduleImport(
              j,
              root,
              '@ant-design/compatible',
              'Icon',
              'LegacyIcon',
            );
          });
      }
    }

    if (targetIconComponents.size() === 0) {
      return hasChanged;
    }

    targetIconComponents.forEach(nodePath => {
      const oldIconComponent = nodePath.parent.node;
      const typeAttr = oldIconComponent.attributes.find(
        attr => attr.name.name === 'type',
      );
      const typeValue = typeAttr.value.value;
      const themeAttr = oldIconComponent.attributes.find(
        attr => attr.name.name === 'theme',
      );

      const v4IconComponentName = withThemeSuffix(
        removeTypeTheme(alias(typeValue)),
        // props#theme can be empty
        (themeAttr && themeAttr.value.value) || 'outlined',
      );
      // check if component is valid or not in v4 icons
      if (allIcons[v4IconComponentName]) {
        oldIconComponent.name.name = v4IconComponentName;
        // remove props `type` and `theme`
        oldIconComponent.attributes = oldIconComponent.attributes.filter(
          attr => !['theme', 'type'].includes(attr.name.name),
        );
        // add a new import for v4 icon component
        addSubmoduleImport(j, root, '@ant-design/icons', v4IconComponentName);
        hasChanged = true;
      }
    });

    return hasChanged;
  }

  // remove old Icon imports from antd
  function removeAntdIconImport(j, root) {
    let hasChanged = false;

    // import { Icon } from 'antd';
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
        importDeclaration.specifiers = importDeclaration.specifiers.filter(
          specifier =>
            !specifier.imported || specifier.imported.name !== 'Icon',
        );
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

  hasChanged = rewriteOldIconWithImport(j, root) || hasChanged;
  hasChanged = rewriteAntdStaticIconMethods(j, root) || hasChanged;

  if (hasChanged) {
    removeEmptyModuleImport(j, root, 'antd');
  }

  return hasChanged
    ? root.toSource(options.printOptions || printOptions)
    : null;
};
