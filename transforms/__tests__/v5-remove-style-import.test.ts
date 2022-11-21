import { defineTest } from 'jscodeshift/src/testUtils';

const tests = ['basic'];

const testUnit = 'v5-remove-style-import';

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
