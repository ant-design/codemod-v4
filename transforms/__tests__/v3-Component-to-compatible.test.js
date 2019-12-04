jest.mock('../v3-Component-to-compatible', () => {
  return Object.assign(require.requireActual('../v3-Component-to-compatible'), {
    parser: 'babylon',
  });
});

const tests = ['basic', 'forked-basic', 'alias-import', 'forked-alias-import'];

const defineTest = require('jscodeshift/dist/testUtils').defineTest;

const testUnit = 'v3-Component-to-compatible';

describe(testUnit, () => {
  tests.forEach(test =>
    defineTest(
      __dirname,
      testUnit,
      { antdPkgNames: ['antd', '@forked/antd'] },
      `${testUnit}/${test}`,
    ),
  );
});
