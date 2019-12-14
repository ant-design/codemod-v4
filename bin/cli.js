const path = require('path');
const fs = require('fs');
const isGitClean = require('is-git-clean');
const chalk = require('chalk');
const execa = require('execa');
const globby = require('globby');
const updateCheck = require('update-check');

const jscodeshiftBin = require.resolve('.bin/jscodeshift');
const pkg = require('../package.json');
const summary = require('../transforms/utils/summary');

const transformersDir = path.join(__dirname, '../transforms');

// override default babylon parser config to enable `decorator-legacy`
// https://github.com/facebook/jscodeshift/blob/master/parser/babylon.js
const babylonConfig = path.join(__dirname, './babylon.config.json');

const transformers = [
  'v4-Icon-Outlined',
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
  styleOption = true,
) {
  const args = ['--verbose=2', '--ignore-pattern=**/node_modules/**'];

  // limit usage for cpus
  const cpus = Math.max(2, Math.ceil(require('os').cpus().length / 3));
  args.push('--cpus', cpus);

  args.push('--parser', parser);

  if (parser === 'tsx') {
    args.push('--extensions=tsx,ts,jsx,js');
  } else {
    args.push('--parser-config', babylonConfig);
    args.push('--extensions=jsx,js');
  }

  args.push('--transform', transformerPath);

  if (styleOption) {
    args.push('--importStyles');
  }

  args.push('--antdPkgNames=antd,@alipay/bigfish/antd');
  return args;
}

async function run(filePath, args) {
  const { style: injectStyle } = args;
  let paths = await globby([filePath]);
  // filter for `.js(x) | .ts(x)`
  paths = paths.filter(path => /.(j|t)sx?$/.test(path));

  const jsPaths = paths.filter(path => /.jsx?$/.test(path));
  const tsPaths = paths.filter(path => /.tsx?$/.test(path));

  for (const transformer of transformers) {
    if (jsPaths.length) {
      console.log(
        chalk.bgYellow.bold('JS/JSX files to convert'),
        jsPaths.length,
      );
      await transform(transformer, 'babylon', jsPaths, injectStyle);
    }

    if (tsPaths.length) {
      console.log(chalk.bgBlue.bold('TS/TSX files to convert'), jsPaths.length);
      await transform(transformer, 'tsx', tsPaths, injectStyle);
    }
  }
}

async function transform(transformer, parser, paths, styleOption) {
  console.log(chalk.bgGreen.bold('Transform'), transformer);
  const transformerPath = path.join(transformersDir, `${transformer}.js`);
  const args = getRunnerArgs(transformerPath, parser, styleOption).concat(
    paths,
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
  }
}

async function bootstrap() {
  if (process.env.NODE_ENV !== 'local') {
    // check for updates
    await checkUpdates();
    // check for git status
    await ensureGitClean();
  }

  const dir = process.argv[2];
  const args = require('yargs-parser')(process.argv.slice(3));

  // check for `path`
  if (!dir || !fs.existsSync(dir)) {
    console.log(chalk.yellow('Invalid dir:', dir, ', please pass a valid dir'));
    process.exit(1);
  }
  summary.start();
  await run(dir, args);
  try {
    const output = await summary.output();
    if (output) {
      console.log('----------- antd4 codemod summary -----------\n\n');
      console.table(
        output
          .filter(n => Array.isArray(n) && n.length >= 3)
          .map(n => ({
            filename: n[0],
            source: n[1],
            message: n[2],
          })),
      );
      console.log(
        '\n\n----------- Thanks for using @ant-design/codemod -----------',
      );
    }
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
