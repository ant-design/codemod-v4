const tests = ['basic'];

const defineTest = require('jscodeshift/dist/testUtils').defineTest;

const testUnit = 'v3-Modal-method-with-icon-to-v4';

describe(testUnit, () => {
  tests.forEach(test =>
    defineTest(__dirname, testUnit, null, `${testUnit}/${test}`),
  );
});
