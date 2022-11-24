const { promisify } = require('util');
const path = require('path');
const glob = require('glob');

const globAsync = promisify(glob);

const { transformFile } = require('./transform');

module.exports = async (dir, options = { maxWorkers: 2 }) => {
  const { ignore = ['**/node_modules/**', '**/dist/**'] } = options;
  const start = performance.now();

  const files = await globAsync(`${dir}/**/*.less`, {
    ignore,
    // cwd:,
  });

  const { default: ora } = await import('ora');

  const transformers = files.map(file => async () => {
    const spinner = ora({
      symbol: chalk.bgGreen(' Transform '),
      text: file,
    }).start();
    const changed = await transformFile(path.resolve(dir, file));
    spinner.stopAndPersist({
      symbol: changed ? chalk.bgGreen(' OK ') : chalk.bgYellow(' SKIP '),
    });
    return changed;
  });

  const { default: pAll } = await import('p-all');
  const { default: chalk } = await import('chalk');

  console.log('\n');
  console.log('%s remove-antd-less-import', chalk.bgGreen(' Transform '));
  console.log(`Processing ${files.length} files...`);

// All done.
// Results:
// 0 errors
// 0 unmodified
// 33 skipped
// 0 ok
// Time elapsed: 0.384seconds

  const result = await pAll(transformers, { concurrency: options.maxWorkers });
  console.log('All done.');
  console.log('Result:');
  const changedFileCount = result.filter(Boolean).length;
  console.log(chalk.yellow(`${result.length - changedFileCount} skipped`));
  console.log(chalk.green(`${changedFileCount} ok`));
  console.log(`Time elapsed: ${((performance.now() - start) / 1000).toFixed(3)}seconds`);
  console.log('\n');
};
