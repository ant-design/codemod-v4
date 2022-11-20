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
  'TimePicker.RangePicker': {
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
  'DatePicker.RangePicker': {
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

  // [ [DatePicker], [DatePicker, RangePicker] ]
  const componentTuple = Object.keys(changedComponentPropsMap).map(component =>
    component.split('.'),
  );

  function handlePropsTransform(collection, componentConfig) {
    Object.keys(componentConfig).forEach(propName => {
      collection
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
                existedPropKeyAttr
                  .paths()[0]
                  .value.value.expression.properties.push(
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
  }

  function findAllAssignedNames(localAssignedName, localAssignedNames = []) {
    const collection = root.find(j.VariableDeclarator, {
      init: {
        type: 'Identifier',
        name: localAssignedName,
      },
    });

    if (collection.length > 0) {
      collection.forEach(nodePath => {
        localAssignedNames.push(nodePath.node.id.name);
        findAllAssignedNames(nodePath.node.id.name, localAssignedNames);
      });
    }
    return localAssignedNames;
  }

  // import deprecated components from '@ant-design/compatible'
  function importDeprecatedComponent(j, root) {
    let hasChanged = false;

    // import { Tag, Mention } from 'antd';
    // import { Form, Mention } from '@forked/antd';
    root
      .find(j.Identifier)
      .filter(
        path =>
          componentTuple.map(n => n[0]).includes(path.node.name) &&
          path.parent.node.type === 'ImportSpecifier' &&
          antdPkgNames.includes(path.parent.parent.node.source.value),
      )
      .forEach(path => {
        hasChanged = true;
        // import { Tag } from 'antd'
        // import { Tag as Tag1 } from 'antd'
        const importedComponentName = path.parent.node.imported.name;
        const localComponentName = path.parent.node.local.name;

        const componentConfig = changedComponentPropsMap[importedComponentName];

        const nonCompoundComponent = root.findJSXElements(localComponentName);
        // 处理非 compound component 部分
        if (nonCompoundComponent.length) {
          handlePropsTransform(nonCompoundComponent, componentConfig);
        }

        // 处理 compound component 部分
        const compoundComponentTuple = componentTuple.find(
          n => n[0] === importedComponentName && n[1],
        );
        const [, compoundComponentName] = compoundComponentTuple || [];
        if (compoundComponentName) {
          // <DatePicker.RangePicker dropdownClassName="drop" />
          // JSXMemberExpression
          const compoundComponent = root.find(j.JSXElement, {
            openingElement: {
              name: {
                type: 'JSXMemberExpression',
                object: {
                  type: 'JSXIdentifier',
                  name: localComponentName,
                },
                property: {
                  type: 'JSXIdentifier',
                  name: compoundComponentName,
                },
              },
            },
          });
          if (compoundComponent.length) {
            handlePropsTransform(compoundComponent, componentConfig);
          }

          // const { RangePicker } = DatePicker;
          root
            .find(j.VariableDeclarator, {
              init: {
                type: 'Identifier',
                name: localComponentName,
              },
            })
            .forEach(path => {
              const localComponentNames = path.node.id.properties
                .filter(n => n.key.name === compoundComponentName)
                // 优先处理解构场景
                // key.name: `const { RangePicker } = DatePicker;`
                // value.name: `const { RangePicker: RP1 } = DatePicker;`
                .map(n => n.value?.name || n.key.name);
              localComponentNames.forEach(compoundComponentName => {
                // 处理反复 reassign 的场景
                const localAssignedNames = findAllAssignedNames(
                  compoundComponentName,
                  [compoundComponentName],
                );

                localAssignedNames.forEach(componentName => {
                  const compoundComponent = root.findJSXElements(componentName);
                  if (compoundComponent) {
                    handlePropsTransform(compoundComponent, componentConfig);
                  }
                });
              });
            });

          // const RangerPicker1 = DatePicker.RangePicker;
          // const RangerPicker2 = RangerPicker1;
          root
            .find(j.VariableDeclarator, {
              init: {
                type: 'MemberExpression',
                object: {
                  type: 'Identifier',
                  name: localComponentName,
                },
                property: {
                  type: 'Identifier',
                  name: compoundComponentName,
                },
              },
            })
            .forEach(path => {
              const localAssignedName = path.node.id.name;

              // 处理反复 reassign 的场景
              const localAssignedNames = findAllAssignedNames(
                localAssignedName,
                [localAssignedName],
              );

              localAssignedNames.forEach(componentName => {
                const compoundComponent = root.findJSXElements(componentName);
                if (compoundComponent) {
                  handlePropsTransform(compoundComponent, componentConfig);
                }
              });
            });
        }
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
