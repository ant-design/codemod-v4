const {
  withThemeSuffix,
  removeTypeTheme,
  alias,
} = require('@ant-design/compatible/lib/icon/utils');
const allIcons = require('@ant-design/icons/lib/icons');

function getV4IconComponentName(type, theme) {
  const v4IconComponentName = withThemeSuffix(
    removeTypeTheme(alias(type)),
    theme || 'outlined',
  );

  // check if component is valid or not in v4 icons
  if (allIcons[v4IconComponentName]) {
    return v4IconComponentName;
  }

  console.warn(
    `The icon name '${type}'${
      theme ? `with ${theme}` : ''
    } cannot found, please check it at https://ant.design/components/icon`,
  );
  return '';
}

function createIconJSXElement(j, iconLocalName, attrs = []) {
  const openingElement = j.jsxOpeningElement(
    j.jsxIdentifier(iconLocalName),
    attrs,
  );
  openingElement.selfClosing = true;
  return j.jsxElement(openingElement);
}

module.exports = {
  getV4IconComponentName,
  createIconJSXElement,
};
