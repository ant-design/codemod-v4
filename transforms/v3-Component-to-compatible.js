const { printOptions } = require('./utils/config');
const {
  addSubmoduleImport,
  addStyleModuleImport,
  removeEmptyModuleImport,
} = require('./utils');

const deprecatedComponentNames = ['Form', 'Mention'];

module.exports = (file, api, options) => {
  const j = api.jscodeshift;
  const root = j(file.source);

  const importStyles = 'importStyles' in options ? options.importStyles : true;

  // import deprecated components from '@ant-design/compatible'
  function importDeprecatedComponent(j, root) {
    let hasChanged = false;

    // import { Form, Mention } from 'antd';
    root
      .find(j.Identifier)
      .filter(
        path =>
          deprecatedComponentNames.includes(path.node.name) &&
          path.parent.node.type === 'ImportSpecifier' &&
          path.parent.parent.node.source.value === 'antd',
      )
      .forEach(path => {
        hasChanged = true;
        const importedComponentName = path.parent.node.imported.name;

        // remove old imports
        const importDeclaration = path.parent.parent.node;
        importDeclaration.specifiers = importDeclaration.specifiers.filter(
          specifier =>
            !specifier.imported ||
            specifier.imported.name !== importedComponentName,
        );

        // add new import from '@ant-design/compatible'
        const localComponentName = path.parent.node.local.name;
        addSubmoduleImport(
          j,
          root,
          '@ant-design/compatible',
          importedComponentName,
          localComponentName,
        );

        if (importStyles) {
          addStyleModuleImport(
            j,
            root,
            '@ant-design/compatible/assets/index.css',
          );
        }
      });

    return hasChanged;
  }

  // step1. import deprecated components from '@ant-design/compatible'
  // step2. cleanup antd import if empty
  let hasChanged = false;
  hasChanged = importDeprecatedComponent(j, root) || hasChanged;

  if (hasChanged) {
    removeEmptyModuleImport(j, root, 'antd');
  }

  return hasChanged
    ? root.toSource(options.printOptions || printOptions)
    : null;
};
