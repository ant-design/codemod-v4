jest.mock('../v3-component-with-string-icon-props-to-v4', () => {
  return Object.assign(
    require.requireActual('../v3-component-with-string-icon-props-to-v4'),
    {
      parser: 'babylon',
    },
  );
});

const tests = [
  'avatar',
  'button',
  'result',
  'forked-avatar',
  'forked-button',
  'forked-result',
];

const defineTest = require('jscodeshift/dist/testUtils').defineTest;

const testUnit = 'v3-component-with-string-icon-props-to-v4';

describe(testUnit, () => {
  tests.forEach(test =>
    defineTest(
      __dirname,
      testUnit,
      { antdPkgNames: ['antd', '@forked/antd'].join(',') },
      `${testUnit}/${test}`,
    ),
  );
});
