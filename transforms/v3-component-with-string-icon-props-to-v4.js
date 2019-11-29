const { removeEmptyModuleImport, addSubmoduleImport } = require('./utils');
const { printOptions } = require('./utils/config');
const { getV4IconComponentName } = require('./utils/icon');

const v3ComponentsWithIconPropString = ['Avatar', 'Button', 'Result'];

module.exports = (file, api, options) => {
  const j = api.jscodeshift;
  const root = j(file.source);

  function createIconReactNode(j, componentName) {
    const openingElement = j.jsxOpeningElement(
      j.jsxIdentifier(componentName),
      [],
    );
    openingElement.selfClosing = true;
    const element = j.jsxElement(openingElement);
    return j.jsxExpressionContainer(element);
  }

  // remove old LocaleProvider imports
  function renameV3IconWithStringIconPropImport(j, root) {
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
              const reactNodeIcon = createIconReactNode(j, v4IconComponentName);

              path.parent.node.value = reactNodeIcon;

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

  // step1. remove LocaleProvider import from antd
  // step2. add ConfigProvider import from antd
  // step3. cleanup antd import if empty
  let hasChanged = false;
  hasChanged = renameV3IconWithStringIconPropImport(j, root) || hasChanged;

  if (hasChanged) {
    removeEmptyModuleImport(j, root, 'antd');
  }

  return hasChanged
    ? root.toSource(options.printOptions || printOptions)
    : null;
};
