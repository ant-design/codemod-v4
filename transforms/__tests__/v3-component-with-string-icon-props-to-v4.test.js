const tests = [
  'avatar',
  'button',
  'result',
  'forked-avatar',
  'forked-button',
  'forked-result',
];

const defineTest = require('jscodeshift/src/testUtils').defineTest;

const testUnit = 'v3-component-with-string-icon-props-to-v4';

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
