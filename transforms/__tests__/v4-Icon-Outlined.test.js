const tests = ['basic', 'alias-import'];

const defineTest = require('jscodeshift/src/testUtils').defineTest;

const testUnit = 'v4-Icon-Outlined';

describe(testUnit, () => {
  tests.forEach(test =>
    defineTest(
      __dirname,
      testUnit,
      { antdPkgNames: ['antd', '@forked/antd'].join(',') },
      `${testUnit}/${test}`,
      { parser: 'babylon' },
    ),
  );
});
