const tests = ['basic', 'alias-import'];

const defineTest = require('jscodeshift/dist/testUtils').defineTest;

describe('icon', () => {
  tests.forEach(test =>
    defineTest(
      __dirname,
      'v3-Form-to-v4-Form',
      null,
      `v3-Form-to-v4-Form/${test}`,
    ),
  );
});
