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
    `import { FormComponentProps } from 'antd/es/form';`,
    'basic es import',
  );

  defineSnapshotTest(
    transform,
    {},
    `import { FormComponentProps } from 'antd/lib/form';`,
    'basic lib import',
  );

  defineSnapshotTest(
    transform,
    {},
    `import { FormComponentProps as AAFormProps } from 'antd/es/form';`,
    'alias import from es',
  );

  defineSnapshotTest(
    transform,
    {},
    `import { FormComponentProps as AAFormProps } from 'antd/lib/form';`,
    'alias import from lib',
  );
});
