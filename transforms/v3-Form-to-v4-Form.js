const { printOptions } = require('./config');
const { removeEmptyModuleImport, addSubmoduleImport } = require('./utils');

module.exports = (file, api, options) => {
  const j = api.jscodeshift;
  const root = j(file.source);

  let localComponentName = 'Form';

  // remove old Form imports
  function removeAntdFormImport(j, root) {
    let hasChanged = false;

    // import { Form } from 'antd';
    root
      .find(j.Identifier)
      .filter(
        path =>
          path.node.name === 'Form' &&
          path.parent.node.type === 'ImportSpecifier' &&
          path.parent.parent.node.source.value === 'antd',
      )
      .forEach(path => {
        hasChanged = true;
        localComponentName = path.parent.node.local.name;

        const importDeclaration = path.parent.parent.node;
        importDeclaration.specifiers = importDeclaration.specifiers.filter(
          specifier =>
            !specifier.imported || specifier.imported.name !== 'Form',
        );
      });

    return hasChanged;
  }

  // step1. remove Form import from antd
  // step2. add LegacyForm import from @ant-design/compatible
  // step3. cleanup antd import if empty
  let hasChanged = false;
  hasChanged = removeAntdFormImport(j, root) || hasChanged;

  if (hasChanged) {
    addSubmoduleImport(
      j,
      root,
      '@ant-design/compatible',
      'LegacyForm',
      localComponentName,
    );
    removeEmptyModuleImport(j, root, 'antd');
  }

  return hasChanged
    ? root.toSource(options.printOptions || printOptions)
    : null;
};
