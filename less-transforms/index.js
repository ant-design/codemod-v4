const glob = require('glob');
const { promisify } = require('util');

const globAsync = promisify(glob);

const { transformFile } = require('./transform');

module.exports = async () => {
  const files = await globAsync(`**/*.less`, {
    // cwd:,
    ignore: ['**/node_modules/**', '**/dist/**'],
  });
  for (const file of files) {
    transformFile(file);
  }
};
