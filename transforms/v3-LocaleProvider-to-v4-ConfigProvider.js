const { printOptions } = require('./utils/config');
const { removeEmptyModuleImport, addSubmoduleImport } = require('./utils');

module.exports = (file, api, options) => {
  const j = api.jscodeshift;
  const root = j(file.source);

  let localComponentName = 'LocaleProvider';

  // remove old LocaleProvider imports
  function removeAntdLocaleProviderImport(j, root) {
    let hasChanged = false;

    // import { LocaleProvider } from 'antd';
    root
      .find(j.Identifier)
      .filter(
        path =>
          path.node.name === 'LocaleProvider' &&
          path.parent.node.type === 'ImportSpecifier' &&
          path.parent.parent.node.source.value === 'antd',
      )
      .forEach(path => {
        hasChanged = true;
        localComponentName = path.parent.node.local.name;

        const importDeclaration = path.parent.parent.node;
        importDeclaration.specifiers = importDeclaration.specifiers.filter(
          specifier =>
            !specifier.imported || specifier.imported.name !== 'LocaleProvider',
        );
      });

    return hasChanged;
  }

  // step1. remove LocaleProvider import from antd
  // step2. add ConfigProvider import from antd
  // step3. cleanup antd import if empty
  let hasChanged = false;
  hasChanged = removeAntdLocaleProviderImport(j, root) || hasChanged;

  if (hasChanged) {
    if (localComponentName === 'LocaleProvider') {
      root
        .findJSXElements(localComponentName)
        .find(j.JSXIdentifier, {
          name: localComponentName,
        })
        .forEach(nodePath => {
          nodePath.node.name = 'ConfigProvider';

          addSubmoduleImport(j, root, 'antd', 'ConfigProvider');
        });
    } else {
      addSubmoduleImport(j, root, 'antd', 'ConfigProvider', localComponentName);
    }

    removeEmptyModuleImport(j, root, 'antd');
  }

  return hasChanged
    ? root.toSource(options.printOptions || printOptions)
    : null;
};
