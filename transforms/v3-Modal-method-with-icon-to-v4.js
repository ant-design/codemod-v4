const {
  parseStrToArray,
  removeEmptyModuleImport,
  addSubmoduleImport,
} = require('./utils');
const { printOptions } = require('./utils/config');
const { addIconRelatedMsg } = require('./utils/summary');
const { markDependency } = require('./utils/marker');
const {
  getV4IconComponentName,
  createIconJSXElement,
} = require('./utils/icon');

const modalMethodNames = ['info', 'success', 'error', 'warning', 'confirm'];

module.exports = (file, api, options) => {
  const j = api.jscodeshift;
  const root = j(file.source);
  const antdPkgNames = parseStrToArray(options.antdPkgNames || 'antd');

  function importV4SpecificIcon(j, iconName, before) {
    const iconJSXElement = createIconJSXElement(j, iconName);

    addSubmoduleImport(j, root, {
      moduleName: '@ant-design/icons',
      importedName: iconName,
      before,
    });
    markDependency('@ant-design/icons');

    return iconJSXElement;
  }

  function importLegacyIcon(j, iconProperty, before) {
    // handle it with `@ant-design/compatible`
    const typeAttr = j.jsxAttribute(
      j.jsxIdentifier('type'),
      j.jsxExpressionContainer(iconProperty.value),
    );
    const iconJSXElement = createIconJSXElement(j, 'LegacyIcon', [typeAttr]);

    // add @ant-design/compatible imports
    addSubmoduleImport(j, root, {
      moduleName: '@ant-design/compatible',
      importedName: 'Icon',
      localName: 'LegacyIcon',
      before,
    });
    markDependency('@ant-design/compatible');

    return iconJSXElement;
  }

  // rename old Model.method() calls with `icon#string` argument
  function renameV3ModalMethodCalls(j, root) {
    let hasChanged = false;
    root
      .find(j.Identifier)
      .filter(
        path =>
          path.node.name === 'Modal' &&
          path.parent.node.type === 'ImportSpecifier' &&
          antdPkgNames.includes(path.parent.parent.node.source.value),
      )
      .forEach(path => {
        const localComponentName = path.parent.node.local.name;
        const antdPkgName = path.parent.parent.node.source.value;

        root
          .find(j.CallExpression, {
            callee: {
              object: {
                type: 'Identifier',
                name: localComponentName,
              },
              property: {
                type: 'Identifier',
              },
            },
          })
          .filter(nodePath =>
            modalMethodNames.includes(nodePath.node.callee.property.name),
          )
          .forEach(nodePath => {
            if (
              !Array.isArray(nodePath.node.arguments) ||
              !nodePath.node.arguments[0] ||
              nodePath.node.arguments[0].type !== 'ObjectExpression'
            ) {
              // FIXME: need log?
              // but we cannot know it contains `icon` property
              return;
            }

            const args = nodePath.node.arguments[0];
            const iconProperty = args.properties.find(
              property =>
                property.key.type === 'Identifier' &&
                property.key.name === 'icon',
            );

            // v3-Icon-to-v4-Icon should handle with JSXElement
            if (!iconProperty || iconProperty.value.type === 'JSXElement') {
              return;
            }

            hasChanged = true;

            if (iconProperty.value.type === 'StringLiteral') {
              const v3IconName = iconProperty.value.value;
              const v4IconComponentName = getV4IconComponentName(v3IconName);
              if (v4IconComponentName) {
                const jsxElement = importV4SpecificIcon(
                  j,
                  v4IconComponentName,
                  antdPkgName,
                );
                iconProperty.value = jsxElement;
                return;
              }
              // FIXME: use parent jsxElement
              const location = nodePath.node.loc.start;
              addIconRelatedMsg(file, location, j(nodePath).toSource());
            }

            const jsxElement = importLegacyIcon(j, iconProperty, antdPkgName);
            iconProperty.value = jsxElement;
          });
      });

    return hasChanged;
  }

  // step1. // rename old Model.method() calls
  // step2. cleanup antd import if empty
  let hasChanged = false;
  hasChanged = renameV3ModalMethodCalls(j, root) || hasChanged;

  if (hasChanged) {
    antdPkgNames.forEach(antdPkgName => {
      removeEmptyModuleImport(j, root, antdPkgName);
    });
  }

  return hasChanged
    ? root.toSource(options.printOptions || printOptions)
    : null;
};
