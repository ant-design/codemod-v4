#!/usr/bin/env node
const path = require('path');
const program = require('commander');
const isGitClean = require('is-git-clean');
const chalk = require('chalk');
const execa = require('execa');
const globby = require('globby');
const updateCheck = require('update-check');

const jscodeshiftBin = require.resolve('.bin/jscodeshift');
const pkg = require('../package.json');

const transformersDir = path.join(__dirname, '../', 'transforms');

const transformers = [
  'v4-Icon-Outlined',
  'v3-Icon-to-v4-Icon',
  'v3-Modal-method-with-icon-to-v4',
  'v3-component-with-string-icon-props-to-v4',
  'v3-Component-to-compatible',
  'v3-LocaleProvider-to-v4-ConfigProvider',
];

program.version(`${pkg.name} ${pkg.version}`).usage('<command> [options]');

program
  .command('run')
  .description('antd codemod for antd v4 Form migration')
  .requiredOption('-p, --path <path>', 'The file path to transform')
  .option('-r, --parser <parser-name>', 'parser option to jscodeshift')
  .option('-s, --style', 'Inject style from @ant-design/compatible')
  .action(async cmd => {
    if (process.env.NODE_ENV !== 'local') {
      // check for updates
      await checkUpdates();
      // check for git status
      await ensureGitClean();
    }
    // check for `path`
    if (!cmd.path) {
      console.log(chalk.yellow('You need to pass a `path` option'));
      process.exit(1);
    }
    run(cmd);
  });

program.parse(process.argv);

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

function getRunnerArgs(filePath, transformerPath, parserOption = 'babel') {
  const args = ['--verbose=2', '--ignore-pattern=**/node_modules/**'];

  const extname = path.extname(filePath);
  // use bablyon as default parser
  // will you use Flow?
  let parser = parserOption;
  if (['.tsx', '.ts'].includes(extname)) {
    parser = 'tsx';
  }
  args.push('--parser', parser);

  if (parser === 'tsx') {
    args.push('--extensions=tsx,ts,jsx,js');
  } else {
    args.push('--extensions=jsx,js');
  }

  args.push('--transform', transformerPath);
  return args;
}

async function run(command) {
  const { path: filePath, parser } = command;
  const paths = await globby([filePath]);

  for (const transformer of transformers) {
    const transformerPath = path.join(transformersDir, `${transformer}.js`);
    console.log(chalk.bgGreen.bold('Transform'), transformer);
    const args = getRunnerArgs(filePath, transformerPath, parser);
    try {
      await execa(jscodeshiftBin, [...args, ...paths], {
        stdio: 'inherit',
        stripEof: false,
      });
    } catch (err) {
      console.error(err);
    }
  }
}

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
