const path = require('path');
const fs = require('fs');
const os = require('os');

const isGitClean = require('is-git-clean');
const chalk = require('chalk');
const execa = require('execa');
const globby = require('globby');
const updateCheck = require('update-check');

const jscodeshiftBin = require.resolve('.bin/jscodeshift');
const pkg = require('../package.json');
const summary = require('../transforms/utils/summary');
const marker = require('../transforms/utils/marker');

const transformersDir = path.join(__dirname, '../transforms');

// override default babylon parser config to enable `decorator-legacy`
// https://github.com/facebook/jscodeshift/blob/master/parser/babylon.js
const babylonConfig = path.join(__dirname, './babylon.config.json');
const ignoreConfig = path.join(__dirname, './codemod.ignore');

const transformers = [
  // TODO: 考虑大多数项目并没有直接使用新版本的 `@antd-design/icons`
  // 该项 codemod script 如需使用请通过 extraScripts 传入
  // 'v4-Icon-Outlined',
  'v3-Icon-to-v4-Icon',
  'v3-Modal-method-with-icon-to-v4',
  'v3-component-with-string-icon-props-to-v4',
  'v3-Component-to-compatible',
  'v3-LocaleProvider-to-v4-ConfigProvider',
];

async function ensureGitClean() {
  let clean = false;
  try {
    clean = await isGitClean();
  } catch (err) {
    if (err && err.stderr && err.stderr.includes('Not a git repository')) {
      clean = true;
    }
  }

  if (!clean) {
    console.log(chalk.yellow('Sorry that there are still some git changes'));
    console.log('\n you must commit or stash them firstly');
    process.exit(1);
  }
}

async function checkUpdates() {
  let update;
  try {
    update = await updateCheck(pkg);
  } catch (err) {
    console.log(chalk.yellow(`Failed to check for updates: ${err}`));
  }

  if (update) {
    console.log(
      chalk.blue(`Latest version is ${update.latest}. Please update firstly`),
    );
    process.exit(1);
  }
}

function getRunnerArgs(
  transformerPath,
  parser = 'babylon', // use babylon as default parser
  options = {},
) {
  const args = ['--verbose=2', '--ignore-pattern=**/node_modules/**'];

  // limit usage for cpus
  const cpus = options.cpus || Math.max(2, Math.ceil(os.cpus().length / 3));
  args.push('--cpus', cpus);

  args.push('--parser', parser);

  args.push('--parser-config', babylonConfig);
  args.push('--extensions=tsx,ts,jsx,js');

  args.push('--transform', transformerPath);

  args.push('--ignore-config', ignoreConfig);

  if (options.style) {
    args.push('--importStyles');
  }

  args.push('--antdPkgNames=antd,@alipay/bigfish/antd');
  return args;
}

async function run(filePath, args = {}) {
  // ignore files from gitignore and node_modules
  let paths = await globby([filePath, '!node_modules'], { gitignore: true });
  // filter for `.js(x) | .ts(x)`
  paths = paths.filter(n => /.(j|t)sx?$/.test(n));

  const jsPaths = paths.filter(n => /.jsx?$/.test(n));
  const tsPaths = paths.filter(n => /.tsx?$/.test(n));

  const extraScripts = args.extraScripts ? args.extraScripts.split(',') : [];

  // eslint-disable-next-line no-restricted-syntax
  for (const transformer of transformers.concat(extraScripts)) {
    console.log(chalk.bgYellow.bold('JS/JSX files to convert'), jsPaths.length);
    console.log(chalk.bgBlue.bold('TS/TSX files to convert'), tsPaths.length);

    // eslint-disable-next-line no-await-in-loop
    await transform(transformer, 'babylon', filePath, args);
  }
}

async function transform(transformer, parser, globPath, options) {
  console.log(chalk.bgGreen.bold('Transform'), transformer);
  const transformerPath = path.join(transformersDir, `${transformer}.js`);

  const args = [globPath].concat(
    getRunnerArgs(transformerPath, parser, options),
  );
  try {
    if (process.env.NODE_ENV === 'local') {
      console.log(`Running jscodeshift with: ${args.join(' ')}`);
    }
    await execa(jscodeshiftBin, args, {
      stdio: 'inherit',
      stripEof: false,
    });
  } catch (err) {
    console.error(err);
    if (process.env.NODE_ENV === 'local') {
      const errorLogFile = path.join(__dirname, './error.log');
      fs.appendFileSync(errorLogFile, err);
      fs.appendFileSync(errorLogFile, '\n');
    }
  }
}

function dependenciesAlert(needIcon, needCompatible) {
  console.log(chalk.yellow('Please install the following dependencies:\n'));
  const dependencies = ['antd^4.0.0-rc.0'];
  if (needIcon) {
    dependencies.push('@ant-design/icons^4.0.0-rc.0');
  }

  if (needCompatible) {
    dependencies.push('@ant-design/compatible^1.0.0-rc.0');
  }

  console.log(dependencies.map(n => `* ${n}`).join('\n'));
}

/**
 * options
 * --force   // force skip git checking (dangerously)
 * --cpus=1  // specify cpus cores to use
 * --extraScripts=v4-Icon-Outlined,blabla // add extra codemod scripts to run
 */

async function bootstrap() {
  const dir = process.argv[2];
  // eslint-disable-next-line global-require
  const args = require('yargs-parser')(process.argv.slice(3));
  if (process.env.NODE_ENV !== 'local') {
    // check for updates
    await checkUpdates();
    // check for git status
    if (!args.force) {
      await ensureGitClean();
    } else {
      console.log(
        Array(3)
          .fill(1)
          .map(() =>
            chalk.yellow(
              'WARNING: You are trying to skip git status checking, please be careful',
            ),
          )
          .join('\n'),
      );
    }
  }

  // check for `path`
  if (!dir || !fs.existsSync(dir)) {
    console.log(chalk.yellow('Invalid dir:', dir, ', please pass a valid dir'));
    process.exit(1);
  }
  await summary.start();
  await marker.start();
  await run(dir, args);

  try {
    const output = await summary.output();
    if (Array.isArray(output) && output.length) {
      console.log('----------- antd4 codemod diagnosis -----------\n');
      output
        .filter(n => Array.isArray(n) && n.length >= 3)
        .forEach(n => {
          const [filename, source, message] = n;
          console.log(`file: ${filename}`);
          console.log('>>>', chalk.yellow(source));
          console.log(message);
          console.log('\n');
        });
    }

    console.log('----------- antd4 dependencies alert -----------\n');
    const dependenciesMarkers = await marker.output();
    const needIcon = dependenciesMarkers['@ant-design/icons'];
    const needCompatible = dependenciesMarkers['@ant-design/compatible'];
    dependenciesAlert(needIcon, needCompatible);

    console.log(
      `\n----------- Thanks for using @ant-design/codemod ${pkg.version} -----------`,
    );
  } catch (err) {
    console.log('skip summary due to', err);
  }
}

module.exports = {
  bootstrap,
  ensureGitClean,
  transform,
  run,
  getRunnerArgs,
  checkUpdates,
};
