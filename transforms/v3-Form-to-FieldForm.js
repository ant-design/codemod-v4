const { printOptions } = require('./utils/config');
const {
  addSubmoduleImport,
  removeEmptyModuleImport,
  parseStrToArray,
  removeUnusedCompatiblecss,
} = require('./utils');

function traverseForm(root, api) {
  const j = api.jscodeshift;
  root
    .find(j.JSXElement, {
      openingElement: {
        name: {
          type: 'JSXIdentifier',
          name: 'Form',
        },
      },
    })
    .forEach(path => {
      let initialValue = path.node.openingElement.attributes.find(
        att => att.name.name === 'initialValue',
      );
      if (!initialValue) {
        initialValue = j.jsxAttribute(
          j.jsxIdentifier('initialValue'),
          j.jsxExpressionContainer(j.objectExpression([])),
        );
        path.node.openingElement.attributes.push(initialValue);
      }
      const state = {
        formWrapperInitialValue: initialValue.value.expression.properties,
      };
      traverseFormItem(root, api, state);
      transformDecorator(root, api, state);
    });
}

function traverseDecorator(
  root,
  api,
  { outerFormItem, formWrapperInitialValue, formitem },
) {
  const j = api.jscodeshift;
  const decorators = root.find(j.CallExpression, {
    callee: {
      type: 'CallExpression',
      callee: {
        type: 'Identifier',
        name: 'getFieldDecorator',
      },
    },
  });
  if (!decorators.length) {
    return;
  }
  let form;
  if (outerFormItem) {
    form = outerFormItem;
  } else {
    const formOpen = j.jsxOpeningElement(
      j.jsxIdentifier(formitem || 'Form.Item'),
      [j.jsxAttribute(j.jsxIdentifier('noStyle'))],
      false,
    );
    const formClose = j.jsxClosingElement(
      j.jsxIdentifier(formitem || 'Form.Item'),
    );
    const children = [];
    decorators.get(0).node.arguments.forEach(node => {
      if (node.type === 'JSXElement') {
        children.push(node);
      } else {
        children.push(j.jsxExpressionContainer(node));
      }
    });
    form = j.jsxElement(formOpen, formClose, children, false);
  }
  decorators.replaceWith(path => {
    const fieldName = path.node.callee.arguments[0];
    const options = path.node.callee.arguments[1];
    form.openingElement.attributes.push(
      j.jsxAttribute(
        j.jsxIdentifier('name'),
        fieldName.type === 'StringLiteral'
          ? fieldName
          : j.jsxExpressionContainer(fieldName),
      ),
    );
    if (options && options.properties) {
      options.properties.forEach(prop => {
        if (prop.key.name === 'initialValue' && formWrapperInitialValue) {
          const objectProperty = j.objectProperty(
            fieldName.type === 'StringLiteral'
              ? j.identifier(fieldName.value)
              : fieldName,
            prop.value,
          );
          // computed prop waste 1 hours that I know computed can't pass params
          // plz read https://github.com/benjamn/ast-types/blob/master/gen/builders.ts
          if (fieldName.type !== 'StringLiteral') {
            objectProperty.computed = true;
          }
          formWrapperInitialValue.push(objectProperty);
          return;
        }
        form.openingElement.attributes.push(
          j.jsxAttribute(
            j.jsxIdentifier(prop.key.name),
            j.jsxExpressionContainer(prop.value),
          ),
        );
      });
    }
    return path.node.arguments;
  });
  return form;
}

function traverseFormItem(root, api, state) {
  const j = api.jscodeshift;
  const formAst = state.formitem
    ? {
        name: {
          type: 'JSXIdentifier',
          name: state.formitem,
        },
      }
    : {
        name: {
          type: 'JSXMemberExpression',
          object: {
            type: 'JSXIdentifier',
            name: 'Form',
          },
          property: {
            type: 'JSXIdentifier',
            name: 'Item',
          },
        },
      };
  const formItems = root.find(j.JSXElement, {
    openingElement: {
      type: 'JSXOpeningElement',
      ...formAst,
    },
  });
  formItems.replaceWith(nodepath => {
    const form = traverseDecorator(j(nodepath.node.children), api, {
      outerFormItem: nodepath.node,
      ...state,
    });
    if (form) {
      nodepath.node.children.forEach((child, index) => {
        if (
          child.type === 'JSXExpressionContainer' &&
          child.expression.type === 'JSXElement'
        ) {
          nodepath.node.children[index] = child.expression;
        }
      });
    }
    return nodepath.node;
  });
}

function transformDecorator(root, api, state) {
  const j = api.jscodeshift;
  root
    .find(j.JSXExpressionContainer, {
      expression: {
        callee: {
          callee: {
            type: 'Identifier',
            name: 'getFieldDecorator',
          },
        },
      },
    })
    .replaceWith(path => {
      return traverseDecorator(j(path), api, state);
    });
}
function removeFormCreate(root, api) {
  const j = api.jscodeshift;
  root
    .find(j.CallExpression, {
      callee: {
        type: 'CallExpression',
        callee: {
          object: {
            type: 'Identifier',
            name: 'Form',
          },
          property: {
            type: 'Identifier',
            name: 'create',
          },
        },
      },
    })
    .replaceWith(path => path.node.arguments[0]);
}

function renameCompatibelForm(root, api) {
  const j = api.jscodeshift;
  const antdPkgNames = parseStrToArray('@ant-design/compatible');
  root
    .find(j.Identifier)
    .filter(
      path =>
        path.node.name === 'Form' &&
        path.parent.node.type === 'ImportSpecifier' &&
        antdPkgNames.includes(path.parent.parent.node.source.value),
    )
    .forEach(path => {
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
        moduleName: 'antd',
        importedName: importedComponentName,
        localName: localComponentName,
        before: antdPkgName,
      });
    });
  removeEmptyModuleImport(j, root, '@ant-design/compatible');
  removeUnusedCompatiblecss(j, root);
}

function removeEmptyInitialValue(root, api) {
  const j = api.jscodeshift;
  root
    .find(j.JSXElement, {
      openingElement: {
        name: {
          type: 'JSXIdentifier',
          name: 'Form',
        },
      },
    })
    .replaceWith(path => {
      const { openingElement } = path.node;
      openingElement.attributes = openingElement.attributes.filter(attr => {
        if (
          attr.name.name === 'initialValue' &&
          attr.value.expression.properties &&
          attr.value.expression.properties.length === 0
        ) {
          return false;
        }
        return true;
      });
      return path.node;
    });
}

module.exports = (fileInfo, api, options) => {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);
  [
    renameCompatibelForm,
    removeFormCreate,
    traverseForm,
    traverseFormItem,
    transformDecorator,
    removeEmptyInitialValue,
  ].forEach(fn => fn(root, api, options));
  return root.toSource(options.printOptions || printOptions);
};
