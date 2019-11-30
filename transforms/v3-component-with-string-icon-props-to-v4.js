const { removeEmptyModuleImport, addSubmoduleImport } = require('./utils');
const { printOptions } = require('./utils/config');
const {
  createIconJSXElement,
  getV4IconComponentName,
} = require('./utils/icon');

const v3ComponentsWithIconPropString = ['Avatar', 'Button', 'Result'];

module.exports = (file, api, options) => {
  const j = api.jscodeshift;
  const root = j(file.source);

  // rename v3 component with `icon#string` prop
  function renameV3ComponentWithIconPropImport(j, root) {
    let hasChanged = false;
    root
      .find(j.Identifier)
      .filter(
        path =>
          v3ComponentsWithIconPropString.includes(path.node.name) &&
          path.parent.node.type === 'ImportSpecifier' &&
          path.parent.parent.node.source.value === 'antd',
      )
      .forEach(path => {
        const localComponentName = path.parent.node.local.name;

        root
          .findJSXElements(localComponentName)
          .find(j.JSXAttribute, {
            name: {
              type: 'JSXIdentifier',
              name: 'icon',
            },
            value: {
              type: 'Literal',
            },
          })
          .find(j.Literal)
          .forEach(path => {
            // TODO: 是否考虑将非 Literal 的值增加 warning 的 log
            const v4IconComponentName = getV4IconComponentName(
              path.value.value,
            );
            if (v4IconComponentName) {
              const iconJSXElement = createIconJSXElement(
                j,
                v4IconComponentName,
              );
              // we need a brace to wrap a jsxElement to pass Icon prop
              path.parent.node.value = j.jsxExpressionContainer(iconJSXElement);

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

  // step1. rename v3 component with `icon#string` prop
  // step2. cleanup antd import if empty
  let hasChanged = false;
  hasChanged = renameV3ComponentWithIconPropImport(j, root) || hasChanged;

  if (hasChanged) {
    removeEmptyModuleImport(j, root, 'antd');
  }

  return hasChanged
    ? root.toSource(options.printOptions || printOptions)
    : null;
};
