jest.mock('../v4-Icon-Outlined', () => {
  return Object.assign(require.requireActual('../v4-Icon-Outlined'), {
    parser: 'babylon',
  });
});

const tests = ['basic', 'alias-import'];

const defineTest = require('jscodeshift/dist/testUtils').defineTest;

const testUnit = 'v4-Icon-Outlined';

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
