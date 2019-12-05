const allIcons = require('@ant-design/icons/lib/icons');

const { printOptions } = require('./utils/config');
const { removeEmptyModuleImport, addSubmoduleImport } = require('./utils');

const outlinedIcons = Object.keys(allIcons)
  .filter(n => n.endsWith('Outlined'))
  .map(n => n.replace(/Outlined$/, ''));

module.exports = (file, api, options) => {
  const j = api.jscodeshift;
  const root = j(file.source);

  function renameV4IconWithoutOutlinedImport(j, root) {
    let hasChanged = false;

    // import { Smile } from '@ant-design/icons';
    root
      .find(j.Identifier)
      .filter(
        path =>
          outlinedIcons.includes(path.node.name) &&
          path.parent.node.type === 'ImportSpecifier' &&
          path.parent.parent.node.source.value === '@ant-design/icons',
      )
      .forEach(path => {
        hasChanged = true;
        const localComponentName = path.parent.node.local.name;
        const importComponentName = path.parent.node.imported.name;

        const importDeclaration = path.parent.parent.node;
        importDeclaration.specifiers = importDeclaration.specifiers.filter(
          specifier =>
            !specifier.imported ||
            specifier.imported.name !== importComponentName,
        );

        const outlinedIconName = importComponentName + 'Outlined';

        if (localComponentName === importComponentName) {
          addSubmoduleImport(j, root, {
            moduleName: '@ant-design/icons',
            importedName: outlinedIconName,
          });
          if (localComponentName === importComponentName) {
            root
              .findJSXElements(localComponentName)
              .find(j.JSXIdentifier, {
                name: localComponentName,
              })
              .forEach(nodePath => {
                nodePath.node.name = outlinedIconName;
              });
          }
        } else {
          addSubmoduleImport(j, root, {
            moduleName: '@ant-design/icons',
            importedName: outlinedIconName,
            localName: localComponentName,
          });
        }
      });

    return hasChanged;
  }

  // step1. rename Icon without `outlined` import from @ant-design/icons
  // step2. cleanup antd import if empty
  let hasChanged = false;
  hasChanged = renameV4IconWithoutOutlinedImport(j, root) || hasChanged;

  if (hasChanged) {
    removeEmptyModuleImport(j, root, 'antd');
  }

  return hasChanged
    ? root.toSource(options.printOptions || printOptions)
    : null;
};
