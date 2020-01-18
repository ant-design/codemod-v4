const path = require('path');
const globby = require('globby');
const {
  withThemeSuffix,
  removeTypeTheme,
  alias,
} = require('@ant-design/compatible/lib/icon/utils');

const v4IconModulePath = path.dirname(
  require.resolve('@ant-design/icons/lib/icons'),
);

let allV4Icons = [];
function getAllV4IconNames() {
  if (allV4Icons.length) {
    return allV4Icons;
  }
  // read allIcons by fs
  const iconPaths = globby.sync([`${v4IconModulePath}/*.js`]);
  allV4Icons = iconPaths.map(iconPath => path.basename(iconPath, '.js'));
  return allV4Icons;
}

function getV4IconComponentName(type, theme) {
  const v4IconComponentName = withThemeSuffix(
    removeTypeTheme(alias(type)),
    theme || 'outlined',
  );

  const v4Icons = getAllV4IconNames();

  // check if component is valid or not in v4 icons
  if (v4Icons.includes(v4IconComponentName)) {
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
  getAllV4IconNames,
  getV4IconComponentName,
  createIconJSXElement,
};
