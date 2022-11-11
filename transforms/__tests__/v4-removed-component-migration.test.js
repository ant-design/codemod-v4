jest.mock('../v4-removed-component-migration', () => {
  return Object.assign(require.requireActual('../v4-removed-component-migration'), {
    parser: 'babylon',
  });
});

const tests = ['alias-import'];

const defineTest = require('jscodeshift/dist/testUtils').defineTest;

const testUnit = 'v4-removed-component-migration';

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
