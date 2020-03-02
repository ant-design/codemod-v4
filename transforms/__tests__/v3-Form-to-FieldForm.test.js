jest.mock('../v3-Form-to-FieldForm', () => {
  return Object.assign(require.requireActual('../v3-Form-to-FieldForm'), {
    parser: 'babylon',
  });
});

const tests = [
  'getFieldDecorator',
  'form-item',
  'remove-useless',
  'wrapper-form',
  {
    cmd: 'rename-formitem',
    options: {
      formitem: 'FormItem',
    },
  },
];

const defineTest = require('jscodeshift/dist/testUtils').defineTest;

const testUnit = 'v3-Form-to-FieldForm';

describe(testUnit, () => {
  tests.forEach(test => {
    const cmd = typeof test === 'string' ? test : test.cmd;
    return defineTest(
      __dirname,
      testUnit,
      {
        antdPkgNames: ['antd', '@forked/antd', '@alipay/bigfish/antd'].join(
          ',',
        ),
        ...test.options,
      },
      `${testUnit}/${cmd}`,
    );
  });
});
