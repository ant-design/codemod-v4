const { printOptions } = require('./utils/config');
const {
  addSubmoduleImport,
  addStyleModuleImport,
  removeEmptyModuleImport,
  parseStrToArray,
} = require('./utils');
const { markDependency } = require('./utils/marker');

const deprecatedComponentNames = ['Form', 'Mention'];

module.exports = (file, api, options) => {
  const j = api.jscodeshift;
  const root = j(file.source);
  const antdPkgNames = parseStrToArray(options.antdPkgNames || 'antd');

  // import deprecated components from '@ant-design/compatible'
  function importDeprecatedComponent(j, root) {
    let hasChanged = false;

    // import { Form, Mention } from 'antd';
    // import { Form, Mention } from '@forked/antd';
    root
      .find(j.Identifier)
      .filter(
        path =>
          deprecatedComponentNames.includes(path.node.name) &&
          path.parent.node.type === 'ImportSpecifier' &&
          antdPkgNames.includes(path.parent.parent.node.source.value),
      )
      .forEach(path => {
        hasChanged = true;
        const importedComponentName = path.parent.node.imported.name;
        const antdPkgName = path.parent.parent.node.source.value;

        // remove old imports
        const importDeclaration = path.parent.parent.node;
        importDeclaration.specifiers = importDeclaration.specifiers.filter(
          specifier =>
            !specifier.imported ||
            specifier.imported.name !== importedComponentName,
        );

        // add new import from '@ant-design/compatible'
        const localComponentName = path.parent.node.local.name;
        addSubmoduleImport(j, root, {
          moduleName: '@ant-design/compatible',
          importedName: importedComponentName,
          localName: localComponentName,
          before: antdPkgName,
        });

        addStyleModuleImport(j, root, {
          moduleName: '@ant-design/compatible/assets/index.css',
          after: '@ant-design/compatible',
        });

        markDependency('@ant-design/compatible');
      });

    return hasChanged;
  }

  // step1. import deprecated components from '@ant-design/compatible'
  // step2. cleanup antd import if empty
  let hasChanged = false;
  hasChanged = importDeprecatedComponent(j, root) || hasChanged;

  if (hasChanged) {
    antdPkgNames.forEach(antdPkgName => {
      removeEmptyModuleImport(j, root, antdPkgName);
    });
  }

  return hasChanged
    ? root.toSource(options.printOptions || printOptions)
    : null;
};
