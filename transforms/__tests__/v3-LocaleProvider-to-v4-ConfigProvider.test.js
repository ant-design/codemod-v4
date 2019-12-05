jest.mock('../v3-LocaleProvider-to-v4-ConfigProvider', () => {
  return Object.assign(
    require.requireActual('../v3-LocaleProvider-to-v4-ConfigProvider'),
    {
      parser: 'babylon',
    },
  );
});

const tests = ['basic', 'alias-import', 'forked-basic', 'forked-alias-import'];

const defineTest = require('jscodeshift/dist/testUtils').defineTest;

const testUnit = 'v3-LocaleProvider-to-v4-ConfigProvider';

describe(testUnit, () => {
  tests.forEach(test =>
    defineTest(
      __dirname,
      testUnit,
      { antdPkgNames: ['antd', '@forked/antd'].join(',') },
      `${testUnit}/${test}`,
    ),
  );
});
