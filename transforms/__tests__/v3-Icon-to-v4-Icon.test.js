const tests = [
  'basic',
  'icon-static-methods',
  'misc',
  'forked-basic',
  'forked-icon-static-methods',
  'forked-misc',
];

const defineTest = require('jscodeshift/src/testUtils').defineTest;

const testUnit = 'v3-Icon-to-v4-Icon';

describe(testUnit, () => {
  tests.forEach(test =>
    defineTest(
      __dirname,
      testUnit,
      {
        antdPkgNames: ['antd', '@forked/antd', '@alipay/bigfish/antd'].join(
          ',',
        ),
      },
      `${testUnit}/${test}`,
      { parser: 'babylon' },
    ),
  );
});
