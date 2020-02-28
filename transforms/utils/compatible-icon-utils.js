const { camelCase, upperFirst } = require('lodash');

// copied from https://github.com/ant-design/compatible/blob/master/src/icon/utils.ts
// "translate" these code to commonjs to avoid `babel` and `regenerator-runtime`

const themeMap = {
  filled: 'filled',
  outlined: 'outlined', // default theme
  twoTone: 'twoTone',
};

// moved from https://github.com/ant-design/ant-design/blob/master/components/icon/utils.ts
const fillTester = /-fill$/;
const outlineTester = /-o$/;
const twoToneTester = /-twotone$/;

function withThemeSuffix(type, theme) {
  const result = upperFirst(camelCase(type));
  const realTheme = upperFirst(themeMap[theme]);

  if (theme !== 'outlined' && !realTheme) {
    console.warn(`This icon '${type}' has unknown theme '${theme}'`);
  }

  return result + realTheme;
}

function removeTypeTheme(type) {
  return type
    .replace(fillTester, '')
    .replace(outlineTester, '')
    .replace(twoToneTester, '');
}

// For alias or compatibility
function alias(type) {
  let newType = type;
  switch (type) {
    case 'cross':
      newType = 'close';
      break;
    // https://github.com/ant-design/ant-design/issues/13007
    case 'interation':
      newType = 'interaction';
      break;
    // https://github.com/ant-design/ant-design/issues/16810
    case 'canlendar':
      newType = 'calendar';
      break;
    // https://github.com/ant-design/ant-design/issues/17448
    case 'colum-height':
      newType = 'column-height';
      break;
    default:
  }

  if (type !== newType) {
    console.warn(
      `Icon '${type}' was a typo and is now deprecated, please use '${newType}' instead.`,
    );
  }
  return newType;
}

module.exports = {
  withThemeSuffix,
  removeTypeTheme,
  alias,
};
