jest.mock('../v3-Icon-to-v4-Icon', () => {
  return Object.assign(require.requireActual('../v3-Icon-to-v4-Icon'), {
    parser: 'babylon',
  });
});

const tests = ['basic', 'icon-static-methods', 'misc'];

const defineTest = require('jscodeshift/dist/testUtils').defineTest;

const testUnit = 'v3-Icon-to-v4-Icon';

describe(testUnit, () => {
  tests.forEach(test =>
    defineTest(__dirname, testUnit, null, `${testUnit}/${test}`),
  );
});
