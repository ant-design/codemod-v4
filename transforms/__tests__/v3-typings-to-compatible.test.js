const defineSnapshotTest = require('jscodeshift/src/testUtils')
  .defineSnapshotTest;

const testUnit = 'v3-typings-to-compatible';

const transform = require(`../${testUnit}`);

describe(testUnit, () => {
  defineSnapshotTest(
    transform,
    {},
    `import { FormComponentProps, WrappedFormUtils } from 'antd/es/form';`,
    'basic es import',
    { parser: 'babylon' },
  );

  defineSnapshotTest(
    transform,
    {},
    `import { FormComponentProps, WrappedFormUtils } from 'antd/lib/form';`,
    'basic lib import',
    { parser: 'babylon' },
  );

  defineSnapshotTest(
    transform,
    {},
    `import { FormComponentProps as AAFormProps, WrappedFormUtils as AAWrappedFormUtils } from 'antd/es/form';`,
    'alias import from es',
    { parser: 'babylon' },
  );

  defineSnapshotTest(
    transform,
    {},
    `import { FormComponentProps as AAFormProps, WrappedFormUtils as AAWrappedFormUtils } from 'antd/lib/form';`,
    'alias import from lib',
    { parser: 'babylon' },
  );

  defineSnapshotTest(
    transform,
    {},
    `import { FormComponentProps, FormItemProps, WrappedFormUtils } from 'antd/lib/form';`,
    'basic import: multi',
    { parser: 'babylon' },
  );

  defineSnapshotTest(
    transform,
    {},
    `import { FormComponentProps as AAFormProps, FormItemProps as AAFormItemProps } from 'antd/lib/form';`,
    'alias import: multi',
    { parser: 'babylon' },
  );
});
