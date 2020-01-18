const {
  parseStrToArray,
  removeEmptyModuleImport,
  addSubmoduleImport,
} = require('./utils');
const { printOptions } = require('./utils/config');
const { addIconRelatedMsg } = require('./utils/summary');
const { markDependency } = require('./utils/marker');
const {
  createIconJSXElement,
  getV4IconComponentName,
} = require('./utils/icon');

const v3ComponentsWithIconPropString = ['Avatar', 'Button', 'Result'];

module.exports = (file, api, options) => {
  const j = api.jscodeshift;
  const root = j(file.source);
  const antdPkgNames = parseStrToArray(options.antdPkgNames || 'antd');

  // rename v3 component with `icon#string` prop
  function renameV3ComponentWithIconPropImport(j, root) {
    let hasChanged = false;
    root
      .find(j.Identifier)
      .filter(
        path =>
          v3ComponentsWithIconPropString.includes(path.node.name) &&
          path.parent.node.type === 'ImportSpecifier' &&
          antdPkgNames.includes(path.parent.parent.node.source.value),
      )
      .forEach(path => {
        const localComponentName = path.parent.node.local.name;
        const antdPkgName = path.parent.parent.node.source.value;

        root
          .findJSXElements(localComponentName)
          .find(j.JSXAttribute, {
            name: {
              type: 'JSXIdentifier',
              name: 'icon',
            },
          })
          .filter(
            nodePath =>
              nodePath.node.type === 'StringLiteral' ||
              nodePath.node.type !== 'JSXExpressionContainer',
          )
          .forEach(nodePath => {
            hasChanged = true;

            const iconProperty = nodePath.value;

            // v3-Icon-to-v4-Icon should handle with JSXElement
            if (
              iconProperty.value.type === 'JSXExpressionContainer' &&
              iconProperty.value.expression.type === 'JSXElement'
            ) {
              return;
            }

            if (iconProperty.value.type === 'StringLiteral') {
              const v4IconComponentName = getV4IconComponentName(
                iconProperty.value.value,
              );
              if (v4IconComponentName) {
                const iconJSXElement = createIconJSXElement(
                  j,
                  v4IconComponentName,
                );
                // we need a brace to wrap a jsxElement to pass Icon prop
                iconProperty.value = j.jsxExpressionContainer(iconJSXElement);

                addSubmoduleImport(j, root, {
                  moduleName: '@ant-design/icons',
                  importedName: v4IconComponentName,
                  before: antdPkgName,
                });
                markDependency('@ant-design/icons');
                return;
              }
              const location = nodePath.node.loc.start;
              addIconRelatedMsg(file, location, j(nodePath).toSource());
            }

            // handle it with `@ant-design/compatible`
            const typeAttr = j.jsxAttribute(
              j.jsxIdentifier('type'),
              iconProperty.value,
            );
            const iconJSXElement = createIconJSXElement(j, 'LegacyIcon', [
              typeAttr,
            ]);
            // we need a brace to wrap a jsxElement to pass Icon prop
            iconProperty.value = j.jsxExpressionContainer(iconJSXElement);

            // add @ant-design/compatible imports
            addSubmoduleImport(j, root, {
              moduleName: '@ant-design/compatible',
              importedName: 'Icon',
              localName: 'LegacyIcon',
              before: antdPkgName,
            });
            markDependency('@ant-design/compatible');
          });
      });

    return hasChanged;
  }

  // step1. rename v3 component with `icon#string` prop
  // step2. cleanup antd import if empty
  let hasChanged = false;
  hasChanged = renameV3ComponentWithIconPropImport(j, root) || hasChanged;

  if (hasChanged) {
    antdPkgNames.forEach(antdPkgName => {
      removeEmptyModuleImport(j, root, antdPkgName);
    });
  }

  return hasChanged
    ? root.toSource(options.printOptions || printOptions)
    : null;
};
