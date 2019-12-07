jest.mock('../v3-Component-to-compatible', () => {
  return Object.assign(require.requireActual('../v3-Component-to-compatible'), {
    parser: 'babylon',
  });
});

const tests = ['basic', 'alias-import', 'forked-basic', 'forked-alias-import'];

const defineTest = require('jscodeshift/dist/testUtils').defineTest;

const testUnit = 'v3-Component-to-compatible';

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
