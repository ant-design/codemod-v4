import { defineTest } from 'jscodeshift/src/testUtils';

const tests = ['basic'];

const testUnit = 'v5-props-changed-migration';

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
