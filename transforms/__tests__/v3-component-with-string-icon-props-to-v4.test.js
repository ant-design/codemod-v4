jest.mock('../v3-component-with-string-icon-props-to-v4', () => {
  return Object.assign(
    require.requireActual('../v3-component-with-string-icon-props-to-v4'),
    {
      parser: 'babylon',
    },
  );
});

const tests = ['avatar', 'button', 'result'];

const defineTest = require('jscodeshift/dist/testUtils').defineTest;

const testUnit = 'v3-component-with-string-icon-props-to-v4';

describe(testUnit, () => {
  tests.forEach(test =>
    defineTest(__dirname, testUnit, null, `${testUnit}/${test}`),
  );
});
