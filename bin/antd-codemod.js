const minimist = require('minimist');
const program = require('commander');
const pkg = require('../package.json');

program.version(`${pkg.name} ${pkg.version}`).usage('<command> [options]');

program
  .command('form <path>')
  .description('antd codemod for antd v4 Form migration')
  .action((path, cmd) => {
    console.log(name, cmd);
  });

program
  .command('icon <path>')
  .description('antd codemod for antd v4 Icon migration')
  .action((path, cmd) => {
    console.log(name, cmd);
  });

program.parse(process.argv);
