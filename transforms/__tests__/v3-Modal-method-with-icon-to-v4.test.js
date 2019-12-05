jest.mock('../v3-Modal-method-with-icon-to-v4', () => {
  return Object.assign(
    require.requireActual('../v3-Modal-method-with-icon-to-v4'),
    {
      parser: 'babylon',
    },
  );
});

const tests = ['basic', 'forked-misc'];

const defineTest = require('jscodeshift/dist/testUtils').defineTest;

const testUnit = 'v3-Modal-method-with-icon-to-v4';

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
