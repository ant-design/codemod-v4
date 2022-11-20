const fs = require('fs');
const path = require('path');

const { transform } = require('../transform');

const fixturesDir = path.join(__dirname, './fixtures');

it('less transform', async () => {
  const content = await fs.promises.readFile(
    path.join(fixturesDir, 'input.less'),
    'utf8',
  );
  const output = await transform(content);
  expect(output).toBe(
    await fs.promises.readFile(path.join(fixturesDir, 'output.less'), 'utf8'),
  );
});
