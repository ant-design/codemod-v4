const glob = require('glob');
const { promisify } = require('util');

const globAsync = promisify(glob);

const { transformFile } = require('./transform');

module.exports = async (dir, options = {}) => {
  const { ignore = ['**/node_modules/**', '**/dist/**'] } = options;

  const files = await globAsync(`${dir}/**/*.less`, {
    ignore,
    // cwd:,
  });
  for (const file of files) {
    await transformFile(file);
  }
};
