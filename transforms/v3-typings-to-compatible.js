const { printOptions } = require('./utils/config');
const { addSubmoduleImport, removeEmptyModuleImport } = require('./utils');
const { markDependency } = require('./utils/marker');

const deprecatedIdentityShape = [
  {
    identity: 'FormComponentProps',
    rule: /^antd\/(es|lib)\/form/,
    importSourceUpdater: source =>
      source.replace(/^antd\//, '@ant-design/compatible/'),
  },
  {
    identity: 'WrappedFormUtils',
    rule: /^antd\/(es|lib)\/form/,
    importSourceUpdater: source =>
      source.replace(/^antd\//, '@ant-design/compatible/'),
  },
];

module.exports = (file, api, options) => {
  const j = api.jscodeshift;
  const root = j(file.source);
  const antdSubfolderImportSource = new Set();

  // import deprecated typing identity from '@ant-design/compatible'
  function importDeprecatedTypings(j, root) {
    let hasChanged = false;

    // import { Form, Mention } from 'antd';
    // import { Form, Mention } from '@forked/antd';
    root.find(j.Identifier).forEach(path => {
      // eslint-disable-next-line no-restricted-syntax
      for (const config of deprecatedIdentityShape) {
        if (
          config.identity === path.node.name &&
          path.parent.node.type === 'ImportSpecifier' &&
          config.rule.test(path.parent.parent.node.source.value)
        ) {
          hasChanged = true;
          const importedComponentName = path.parent.node.imported.name;
          const importedSource = path.parent.parent.node.source.value;
          antdSubfolderImportSource.add(importedSource);

          // remove old imports
          const importDeclaration = path.parent.parent.node;
          importDeclaration.specifiers = importDeclaration.specifiers.filter(
            specifier =>
              !specifier.imported ||
              specifier.imported.name !== importedComponentName,
          );

          // add new import from '@ant-design/compatible/subfolder'
          const localComponentName = path.parent.node.local.name;
          addSubmoduleImport(j, root, {
            moduleName: config.importSourceUpdater(importedSource),
            importedName: importedComponentName,
            localName: localComponentName,
            before: importedSource,
          });

          markDependency('@ant-design/compatible');
          return;
        }
      }
    });

    return hasChanged;
  }

  // step1. import deprecated components from '@ant-design/compatible'
  // step2. cleanup antd import if empty
  let hasChanged = false;
  hasChanged = importDeprecatedTypings(j, root) || hasChanged;

  if (hasChanged) {
    antdSubfolderImportSource.forEach(source => {
      removeEmptyModuleImport(j, root, source);
    });
  }

  return hasChanged
    ? root.toSource(options.printOptions || printOptions)
    : null;
};
