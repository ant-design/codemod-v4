import { defineTest } from 'jscodeshift/src/testUtils';

const testUnit = 'v5-removed-component-migration';
const tests = ['alias-import'];

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
