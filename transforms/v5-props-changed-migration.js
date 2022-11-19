const { printOptions } = require('./utils/config');
const { parseStrToArray } = require('./utils');
const {
  createObjectProperty,
  createObjectExpression,
  getJSXAttributeValue,
} = require('./utils/ast');

const changedComponentPropsMap = {
  AutoComplete: {
    dropdownClassName: {
      action: 'rename',
      replacer: 'popupClassName',
    },
  },
  Cascader: {
    dropdownClassName: {
      action: 'rename',
      replacer: 'popupClassName',
    },
  },
  Select: {
    dropdownClassName: {
      action: 'rename',
      replacer: 'popupClassName',
    },
  },
  TreeSelect: {
    dropdownClassName: {
      action: 'rename',
      replacer: 'popupClassName',
    },
  },
  // 处理 compound components: TimePicker.RangePicker
  TimePicker: {
    dropdownClassName: {
      action: 'rename',
      replacer: 'popupClassName',
    },
  },
  // 处理 compound components: DatePicker.RangePicker
  DatePicker: {
    dropdownClassName: {
      action: 'rename',
      replacer: 'popupClassName',
    },
  },
  Mentions: {
    dropdownClassName: {
      action: 'rename',
      replacer: 'popupClassName',
    },
  },
  Drawer: {
    visible: {
      action: 'rename',
      replacer: 'open',
    },
    className: {
      action: 'rename',
      replacer: 'rootClassName',
    },
    style: {
      action: 'rename',
      replacer: 'rootStyle',
    },
  },
  Modal: {
    visible: {
      action: 'rename',
      replacer: 'open',
    },
  },
  Dropdown: {
    visible: {
      action: 'rename',
      replacer: 'open',
    },
  },
  Tooltip: {
    visible: {
      action: 'rename',
      replacer: 'open',
    },
  },
  Tag: {
    visible: {
      action: 'remove',
    },
  },
  Slider: {
    tipFormatter: {
      action: 'rename',
      replacer: 'tooltip.formatter',
    },
    tooltipPlacement: {
      action: 'rename',
      replacer: 'tooltip.placement',
    },
    tooltipVisible: {
      action: 'rename',
      replacer: 'tooltip.open',
    },
  },
  Table: {
    filterDropdownVisible: {
      action: 'rename',
      replacer: 'filterDropdownOpen',
    },
  },
};

module.exports = (file, api, options) => {
  const j = api.jscodeshift;
  const root = j(file.source);
  const antdPkgNames = parseStrToArray(options.antdPkgNames || 'antd');

  // import deprecated components from '@ant-design/compatible'
  function importDeprecatedComponent(j, root) {
    let hasChanged = false;

    // import { Tag, Mention } from 'antd';
    // import { Form, Mention } from '@forked/antd';
    root
      .find(j.Identifier)
      .filter(
        path =>
          Object.keys(changedComponentPropsMap).includes(path.node.name) &&
          path.parent.node.type === 'ImportSpecifier' &&
          antdPkgNames.includes(path.parent.parent.node.source.value),
      )
      .forEach(path => {
        hasChanged = true;
        // import { Tag } from 'antd'
        // import { Tag as Tag1 } from 'antd'
        const importedComponentName = path.parent.node.imported.name;
        const localComponentName = path.parent.node.local.name;
        const antdPkgName = path.parent.parent.node.source.value;

        const componentConfig = changedComponentPropsMap[importedComponentName];
        Object.keys(componentConfig).forEach(propName => {
          root
            .findJSXElements(localComponentName)
            .find(j.JSXAttribute, {
              name: {
                type: 'JSXIdentifier',
                name: propName,
              },
            })
            .forEach(nodePath => {
              const { action, replacer } = componentConfig[propName];
              if (action === 'rename' && replacer) {
                // <Slider tooltipVisible /> -> <Slider tooltip={{open: true}} />
                if (replacer.includes('.')) {
                  const value = getJSXAttributeValue(j, nodePath);

                  // delete origin `props`
                  nodePath.parent.node.attributes = nodePath.parent.node.attributes.filter(
                    attr => attr.name.name !== propName,
                  );

                  const [propKey, propSubKey] = replacer.split('.');
                  // 检测是否已存在对应的 property 没有则创建一个新的
                  // 获取 `Tag` 的 props
                  let existedPropKeyAttr = j(nodePath.parent.parent).find(
                    j.JSXAttribute,
                    {
                      name: {
                        type: 'JSXIdentifier',
                        name: propKey,
                      },
                    },
                  );
                  if (existedPropKeyAttr.length === 0) {
                    const newPropKeyAttr = j.jsxAttribute(
                      j.jsxIdentifier(propKey),
                      j.jsxExpressionContainer(
                        createObjectExpression(j, {
                          [propSubKey]: value,
                        }),
                      ),
                    );

                    // 给对应 property 新增值
                    nodePath.parent.node.attributes.push(newPropKeyAttr);
                  } else {
                    existedPropKeyAttr.__paths[0].value.value.expression.properties.push(
                      createObjectProperty(j, propSubKey, value),
                    );
                  }
                } else {
                  // <Modal visible={1} /> -> <Modal open={1} />
                  nodePath.node.name = replacer;
                }
              }

              if (action === 'remove') {
                // <Tag visible="1" />
                let value = nodePath.value.value;
                // <Tag visible={1} />
                // 取出来 JSXExpressionContainer 其中值部分
                if (nodePath.value?.value?.type === 'JSXExpressionContainer') {
                  value = nodePath.value.value.expression;
                }

                // delete origin `props`
                nodePath.parent.node.attributes = nodePath.parent.node.attributes.filter(
                  attr => attr.name.name !== propName,
                );

                // <Tag visible />
                // 这种情况直接去掉 visible 即可

                // 有 value 再创建条件语句，没有 value 则默认为 true
                // create a conditional expression
                const conditionalExpression = value
                  ? j.conditionalExpression(
                      value,
                      // Component Usage JSXElement `<Tag />`
                      nodePath.parent.parent.node,
                      j.nullLiteral(),
                    )
                  : null;

                // <><Tag visible={vi} /></>
                // <div><Tag visible={vi} /></div>
                // return (<Tag visible={vi} />);
                //  <- transform to ->
                // <>{vi && <Tag />}</>
                // <div>{vi && <Tag />}</div>
                // return (vi && <Tag />)

                if (conditionalExpression) {
                  // vi(JSXIdentifier) -> `<`(JSXOpeningElement) -> <Tag/>(JSXElement)
                  // -> `<></>`(JSXFragment) | `<div></div>`(JSXElement)
                  if (
                    ['JSXElement', 'JSXFragment'].includes(
                      nodePath.parent.parent.parent.node.type,
                    )
                  ) {
                    const index = nodePath.parent.parent.parent.node.children.findIndex(
                      n => n === nodePath.parent.parent.node,
                    );
                    if (index > -1) {
                      nodePath.parent.parent.parent.node.children.splice(
                        index,
                        1,
                        // add `{}`
                        j.jsxExpressionContainer(conditionalExpression),
                      );
                    }
                  } else if (
                    ['ReturnStatement'].includes(
                      nodePath.parent.parent.parent.node.type,
                    )
                  ) {
                    nodePath.parent.parent.parent.node.argument = conditionalExpression;
                  }
                }

                // 将 jsx element 转为一个条件表达式，并使用小括号包住
                // 最后再检查是不是有一个大的 {} JSXExpressionContainer 包住
              }
            });
        });
      });

    return hasChanged;
  }

  // step1. import deprecated components from '@ant-design/compatible'
  // step2. cleanup antd import if empty
  let hasChanged = false;
  hasChanged = importDeprecatedComponent(j, root) || hasChanged;

  return hasChanged
    ? root.toSource(options.printOptions || printOptions)
    : null;
};
