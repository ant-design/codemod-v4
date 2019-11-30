const tests = ['basic', 'alias-import'];

const defineTest = require('jscodeshift/dist/testUtils').defineTest;

const testUnit = 'v3-Component-to-compatible';

describe(testUnit, () => {
  tests.forEach(test =>
    defineTest(__dirname, testUnit, null, `${testUnit}/${test}`),
  );
});
