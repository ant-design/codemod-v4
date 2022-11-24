/* eslint no-console: 0 */

const path = require('path');
const fs = require('fs');
const os = require('os');

const _ = require('lodash');
const chalk = require('chalk');
const execa = require('execa');
const isGitClean = require('is-git-clean');
const updateCheck = require('update-check');
const readPkgUp = require('read-pkg-up');
const findUp = require('find-up');
const semverSatisfies = require('semver/functions/satisfies');

const jscodeshiftBin = require.resolve('.bin/jscodeshift');

const summary = require('../transforms/utils/summary');
const marker = require('../transforms/utils/marker');
const pkg = require('../package.json');
const pkgUpgradeList = require('./upgrade-list');

const transformLess = require('../less-transforms');

// jscodeshift codemod scripts dir
const transformersDir = path.join(__dirname, '../transforms');

// override default babylon parser config to enable `decorator-legacy`
// https://github.com/facebook/jscodeshift/blob/master/parser/babylon.js
const babylonConfig = path.join(__dirname, './babylon.config.json');

// jscodeshift bin#--ignore-config
const ignoreConfig = path.join(__dirname, './codemod.ignore');

const transformers = [
  'v5-props-changed-migration',
  'v5-removed-component-migration',
  'v5-remove-style-import',
];

const dependencyProperties = [
  'dependencies',
  'devDependencies',
  'clientDependencies',
  'isomorphicDependencies',
  'buildDependencies',
];

async function ensureGitClean() {
  let clean = false;
  try {
    clean = await isGitClean();
  } catch (err) {
    if (
      err &&
      err.stderr &&
      err.stderr.toLowerCase().includes('not a git repository')
    ) {
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

function getMaxWorkers(options = {}) {
  // limit usage for cpus
  return options.cpus || Math.max(2, Math.ceil(os.cpus().length / 3));
}

function getRunnerArgs(
  transformerPath,
  parser = 'babylon', // use babylon as default parser
  options = {},
) {
  const args = ['--verbose=2', '--ignore-pattern=**/node_modules'];

  // limit usage for cpus
  const cpus = getMaxWorkers(options);
  args.push('--cpus', cpus);

  // https://github.com/facebook/jscodeshift/blob/master/src/Runner.js#L255
  // https://github.com/facebook/jscodeshift/blob/master/src/Worker.js#L50
  args.push('--no-babel');

  args.push('--parser', parser);

  args.push('--parser-config', babylonConfig);
  args.push('--extensions=tsx,ts,jsx,js');

  args.push('--transform', transformerPath);

  args.push('--ignore-config', ignoreConfig);

  if (options.gitignore) {
    args.push('--ignore-config', options.gitignore);
  }

  if (options.style) {
    args.push('--importStyles');
  }

  args.push('--antdPkgNames=antd,@alipay/bigfish/antd');
  return args;
}

async function run(filePath, args = {}) {
  const extraScripts = args.extraScripts ? args.extraScripts.split(',') : [];

  // eslint-disable-next-line no-restricted-syntax
  for (const transformer of transformers.concat(extraScripts)) {
    // eslint-disable-next-line no-await-in-loop
    await transform(transformer, 'babylon', filePath, args);
  }

  await lessTransform(filePath, args);
}

async function lessTransform(filePath, options) {
  const maxWorkers = getMaxWorkers(options);
  return await transformLess(filePath, { maxWorkers });
}

async function transform(transformer, parser, filePath, options) {
  console.log(chalk.bgGreen.bold('Transform'), transformer);
  const transformerPath = path.join(transformersDir, `${transformer}.js`);

  // pass closet .gitignore to jscodeshift as extra `--ignore-file` option
  // const gitignorePath = await findGitIgnore(filePath);

  const args = [filePath].concat(
    getRunnerArgs(transformerPath, parser, {
      ...options,
      // gitignore: gitignorePath,
    }),
  );

  try {
    if (process.env.NODE_ENV === 'local') {
      console.log(`Running jscodeshift with: ${args.join(' ')}`);
    }
    // js part
    await execa(jscodeshiftBin, args, {
      stdio: 'inherit',
      stripEof: false,
    });
    // less part
    // `@antd/xxxx` | `~@antd/xxxx`
  } catch (err) {
    console.error(err);
    if (process.env.NODE_ENV === 'local') {
      const errorLogFile = path.join(__dirname, './error.log');
      fs.appendFileSync(errorLogFile, err);
      fs.appendFileSync(errorLogFile, '\n');
    }
  }
}

async function upgradeDetect(targetDir, needIcon, needCompatible) {
  const result = [];
  const cwd = path.join(process.cwd(), targetDir);
  const closetPkgJson = await readPkgUp({ cwd });

  let pkgJsonPath;
  if (!closetPkgJson) {
    pkgJsonPath = "we didn't find your package.json";
    // unknown dependency property
    result.push(['install', 'antd', pkgUpgradeList.antd]);
    if (needIcon) {
      result.push([
        'install',
        '@ant-design/icons',
        pkgUpgradeList['@ant-design/icons'].version,
      ]);
    }

    if (needCompatible) {
      result.push([
        'install',
        '@ant-design/compatible',
        pkgUpgradeList['@ant-design/compatible'].version,
      ]);
    }
  } else {
    const { packageJson } = closetPkgJson;
    pkgJsonPath = closetPkgJson.path;

    // dependencies must be installed or upgraded with correct version
    const mustInstallOrUpgradeDeps = ['antd'];
    if (needIcon) {
      mustInstallOrUpgradeDeps.push('@ant-design/icons');
    }
    if (needCompatible) {
      mustInstallOrUpgradeDeps.push('@ant-design/compatible');
    }

    // handle mustInstallOrUpgradeDeps
    mustInstallOrUpgradeDeps.forEach(depName => {
      let hasDependency = false;
      const expectVersion = pkgUpgradeList[depName].version;
      // const upgradePkgDescription = pkgUpgradeList[depName].description;
      dependencyProperties.forEach(property => {
        const versionRange = _.get(packageJson, `${property}.${depName}`);
        // mark dependency installment state
        hasDependency = hasDependency || !!versionRange;
        // no dependency or improper version dependency
        if (!!versionRange && !semverSatisfies(expectVersion, versionRange)) {
          result.push(['update', depName, expectVersion, property]);
        }
      });
      if (!hasDependency) {
        // unknown dependency property
        result.push(['install', depName, pkgUpgradeList[depName].version]);
      }
    });

    // dependencies must be upgraded to correct version
    const mustUpgradeDeps = _.without(
      Object.keys(pkgUpgradeList),
      ...mustInstallOrUpgradeDeps,
    );
    mustUpgradeDeps.forEach(depName => {
      dependencyProperties.forEach(property => {
        const expectVersion = pkgUpgradeList[depName].version;
        const versionRange = _.get(packageJson, `${property}.${depName}`);
        /**
         * we may have dependencies in `package.json`
         * make sure that they can `work well` with `antd5`
         * so we check dependency's version here
         */
        if (!!versionRange && !semverSatisfies(expectVersion, versionRange)) {
          result.push(['update', depName, expectVersion, property]);
        }
      });
    });
  }

  if (!result.length) {
    console.log(chalk.green('Checking passed'));
    return;
  }

  console.log(
    chalk.yellow(
      "It's recommended to install or upgrade these dependencies to ensure working well with antd v5\n",
    ),
  );
  console.log(`> package.json file:  ${pkgJsonPath} \n`);
  const dependencies = result.map(
    ([operateType, depName, expectVersion, dependencyProperty]) =>
      [
        _.capitalize(operateType),
        `${depName}^${expectVersion}`,
        dependencyProperty ? `in ${dependencyProperty}` : '',
      ].join(' '),
  );

  console.log(dependencies.map(n => `* ${n}`).join('\n'));
}

async function findGitIgnore(targetDir) {
  const cwd = path.join(process.cwd(), targetDir);
  return await findUp('.gitignore', { cwd });
}

/**
 * options
 * --force   // force skip git checking (dangerously)
 * --cpus=1  // specify cpus cores to use
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
      console.log('----------- antd5 codemod diagnosis -----------\n');
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

    console.log('----------- antd5 dependencies alert -----------\n');
    const dependenciesMarkers = await marker.output();
    const needIcon = dependenciesMarkers['@ant-design/icons'];
    const needCompatible = dependenciesMarkers['@ant-design/compatible'];
    await upgradeDetect(dir, needIcon, needCompatible);

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
