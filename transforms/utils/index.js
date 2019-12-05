// some utils extract from https://github.com/reactjs/react-codemod
function insertImportStatement(j, root, path, importStatement) {
  // 保留首行的注释
  // https://github.com/facebook/jscodeshift/blob/master/recipes/retain-first-comment.md
  const firstNode = root.find(j.Program).get('body', 0).node;
  const { comments } = firstNode;
  if (comments) {
    delete firstNode.comments;
    importStatement.comments = comments;
  }

  j(path).insertBefore(importStatement);
}

function hasSubmoduleImport(j, root, moduleName, submoduleName) {
  return (
    root
      .find(j.ImportDeclaration, {
        source: {
          value: moduleName,
        },
      })
      .find(j.ImportSpecifier, {
        imported: {
          name: submoduleName,
        },
      }).length > 0
  );
}

function hasModuleImport(j, root, moduleName) {
  return (
    root.find(j.ImportDeclaration, {
      source: { value: moduleName },
    }).length > 0
  );
}

function hasModuleDefaultImport(j, root, pkgName, localModuleName) {
  let found = false;
  root
    .find(j.ImportDeclaration, {
      source: { value: pkgName },
    })
    .forEach(nodePath => {
      const defaultImport = nodePath.node.specifiers.filter(
        n =>
          n.type === 'ImportDefaultSpecifier' &&
          n.local.name === localModuleName,
      );
      if (defaultImport.length) {
        found = true;
      }
    });
  return found;
}

function findImportAfterModule(j, root, moduleName) {
  let target, targetName;

  root.find(j.ImportDeclaration).forEach(path => {
    const name = path.value.source.value.toLowerCase();
    if (name > moduleName && (!target || name < targetName)) {
      targetName = name;
      target = path;
    }
  });

  return target;
}

function removeEmptyModuleImport(j, root, moduleName) {
  root
    .find(j.ImportDeclaration)
    .filter(
      path =>
        path.node.specifiers.length === 0 &&
        path.node.source.value === moduleName,
    )
    .replaceWith();
}

// Program uses var keywords
function useVar(j, root) {
  return root.find(j.VariableDeclaration, { kind: 'const' }).length === 0;
}

function addModuleImport(j, root, pkgName, importSpecifier) {
  // if has module imported, just import new submodule from existed
  // else just create a new import
  if (hasModuleImport(j, root, pkgName)) {
    root
      .find(j.ImportDeclaration, {
        source: { value: pkgName },
      })
      .at(0)
      .replaceWith(({ node }) => {
        const mergedImportSpecifiers = node.specifiers
          .concat(importSpecifier)
          .sort((a, b) => {
            if (a.type === 'ImportDefaultSpecifier') {
              return -1;
            }

            if (b.type === 'ImportDefaultSpecifier') {
              return 1;
            }

            return a.imported.name.localeCompare(b.imported.name);
          });
        return j.importDeclaration(mergedImportSpecifiers, j.literal(pkgName));
      });
    return true;
  }

  const path = findImportAfterModule(j, root, pkgName);
  if (path) {
    const importStatement = j.importDeclaration(
      [importSpecifier],
      j.literal(pkgName),
    );

    insertImportStatement(j, root, path, importStatement);
    return true;
  }
}

function addModuleDefaultImport(j, root, pkgName, localModuleName) {
  if (hasModuleDefaultImport(j, root, pkgName, localModuleName)) {
    return;
  }

  const newDefaultImportSpecifier = j.importDefaultSpecifier(
    j.identifier(localModuleName),
  );

  if (addModuleImport(j, root, pkgName, newDefaultImportSpecifier)) {
    return;
  }

  throw new Error(`No ${pkgName} import found!`);
}

function addSubmoduleImport(
  j,
  root,
  pkgName,
  importedModuleName,
  localModuleName,
) {
  if (hasSubmoduleImport(j, root, pkgName, importedModuleName)) {
    return;
  }

  const newImportSpecifier = j.importSpecifier(
    j.identifier(importedModuleName),
    localModuleName ? j.identifier(localModuleName) : null,
  );

  if (addModuleImport(j, root, pkgName, newImportSpecifier)) {
    return;
  }

  throw new Error(`No ${pkgName} import found!`);
}

function addStyleModuleImport(j, root, pkgName) {
  if (hasModuleImport(j, root, pkgName)) {
    return;
  }

  const path = findImportAfterModule(j, root, pkgName);
  if (path) {
    const importStatement = j.importDeclaration([], j.literal(pkgName));

    insertImportStatement(j, root, path, importStatement);
    return;
  }

  throw new Error(`No ${pkgName} import found!`);
}

function parseStrToArray(antdPkgNames) {
  return (antdPkgNames || '')
    .split(',')
    .filter(n => n)
    .map(n => n.trim());
}

module.exports = {
  parseStrToArray,
  addModuleDefaultImport,
  addStyleModuleImport,
  addSubmoduleImport,
  removeEmptyModuleImport,
  useVar,
};
