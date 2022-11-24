exports.createObjectProperty = function(j, key, value) {
  return j.property('init', j.identifier(key), value);
};

exports.createObjectExpression = function(j, obj) {
  return j.objectExpression(
    Object.entries(obj).map(([key, val]) =>
      exports.createObjectProperty(j, key, val),
    ),
  );
};

exports.getJSXAttributeValue = function(j, nodePath) {
  // <Tag visible="1" />
  let value = nodePath.value.value;
  // <Tag visible={1} />
  // 取出来 JSXExpressionContainer 其中值部分
  if (nodePath.value?.value?.type === 'JSXExpressionContainer') {
    value = nodePath.value.value.expression;
  }
  return value;
};
