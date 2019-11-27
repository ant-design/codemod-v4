const tests = ['basic', 'icon-static-methods'];

const defineTest = require('jscodeshift/dist/testUtils').defineTest;

describe('icon', () => {
  tests.forEach(test =>
    defineTest(
      __dirname,
      'v3-Icon-to-v4-Icon',
      null,
      `v3-Icon-to-v4-Icon/${test}`,
    ),
  );
});
