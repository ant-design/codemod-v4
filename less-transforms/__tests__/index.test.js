const fs = require('fs');
const path = require('path');

const { transform } = require('../transform');

const fixturesDir = path.join(__dirname, './fixtures');
const inputLess = path.join(fixturesDir, 'input.less');
const outputLess = path.join(fixturesDir, 'output.less');

it('less transform', async () => {
  const content = await fs.promises.readFile(inputLess, 'utf8');
  const output = await transform(content, { from: inputLess });
  expect(output).toBe(await fs.promises.readFile(outputLess, 'utf8'));
});
