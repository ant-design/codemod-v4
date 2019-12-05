const {
  parseStrToArray,
  removeEmptyModuleImport,
  addSubmoduleImport,
} = require('./utils');
const { printOptions } = require('./utils/config');
const {
  getV4IconComponentName,
  createIconJSXElement,
} = require('./utils/icon');

const modalMethodNames = ['info', 'success', 'error', 'warning', 'confirm'];

module.exports = (file, api, options) => {
  const j = api.jscodeshift;
  const root = j(file.source);
  const antdPkgNames = parseStrToArray(options.antdPkgNames || 'antd');

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
              return;
            }

            const args = nodePath.node.arguments[0];
            const iconProperty = args.properties.find(
              property =>
                property.key.type === 'Identifier' &&
                property.key.name === 'icon' &&
                property.value.type === 'StringLiteral',
            );

            if (!iconProperty) {
              return;
            }

            const v3IconName = iconProperty.value.value;
            const v4IconComponentName = getV4IconComponentName(v3IconName);
            if (v4IconComponentName) {
              const iconJSXElement = createIconJSXElement(
                j,
                v4IconComponentName,
              );
              iconProperty.value = iconJSXElement;

              addSubmoduleImport(
                j,
                root,
                '@ant-design/icons',
                v4IconComponentName,
              );
              hasChanged = true;
            }
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
