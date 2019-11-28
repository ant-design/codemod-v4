const allIcons = require('@ant-design/icons/lib/icons');

const { printOptions } = require('./utils/config');
const { removeEmptyModuleImport, addSubmoduleImport } = require('./utils');

const outlinedIcons = Object.keys(allIcons)
  .filter(n => n.endsWith('Outlined'))
  .map(n => n.replace(/Outlined$/, ''));

module.exports = (file, api, options) => {
  const j = api.jscodeshift;
  const root = j(file.source);

  // remove old LocaleProvider imports
  function renameV4IconWithoutOutlinedImport(j, root) {
    let hasChanged = false;

    // import { LocaleProvider } from 'antd';
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
          addSubmoduleImport(j, root, '@ant-design/icons', outlinedIconName);
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
          addSubmoduleImport(
            j,
            root,
            '@ant-design/icons',
            outlinedIconName,
            localComponentName,
          );
        }
      });

    return hasChanged;
  }

  // step1. remove LocaleProvider import from antd
  // step2. add ConfigProvider import from antd
  // step3. cleanup antd import if empty
  let hasChanged = false;
  hasChanged = renameV4IconWithoutOutlinedImport(j, root) || hasChanged;

  if (hasChanged) {
    removeEmptyModuleImport(j, root, 'antd');
  }

  return hasChanged
    ? root.toSource(options.printOptions || printOptions)
    : null;
};
