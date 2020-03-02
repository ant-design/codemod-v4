jest.mock('../v3-typings-to-compatible', () => {
  return Object.assign(require.requireActual('../v3-typings-to-compatible'), {
    parser: 'babylon',
  });
});

const defineSnapshotTest = require('jscodeshift/dist/testUtils')
  .defineSnapshotTest;

const testUnit = 'v3-typings-to-compatible';

const transform = require(`../${testUnit}`);

describe(testUnit, () => {
  defineSnapshotTest(
    transform,
    {},
    `import { FormComponentProps, WrappedFormUtils } from 'antd/es/form';`,
    'basic es import',
  );

  defineSnapshotTest(
    transform,
    {},
    `import { FormComponentProps, WrappedFormUtils } from 'antd/lib/form';`,
    'basic lib import',
  );

  defineSnapshotTest(
    transform,
    {},
    `import { FormComponentProps as AAFormProps, WrappedFormUtils as AAWrappedFormUtils } from 'antd/es/form';`,
    'alias import from es',
  );

  defineSnapshotTest(
    transform,
    {},
    `import { FormComponentProps as AAFormProps, WrappedFormUtils as AAWrappedFormUtils } from 'antd/lib/form';`,
    'alias import from lib',
  );

  defineSnapshotTest(
    transform,
    {},
    `import { FormComponentProps, FormItemProps, WrappedFormUtils } from 'antd/lib/form';`,
    'basic import: multi',
  );

  defineSnapshotTest(
    transform,
    {},
    `import { FormComponentProps as AAFormProps, FormItemProps as AAFormItemProps } from 'antd/lib/form';`,
    'alias import: multi',
  );
});
