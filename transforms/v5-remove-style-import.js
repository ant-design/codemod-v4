const { printOptions } = require('./utils/config');
const {
  addSubmoduleImport,
  addStyleModuleImport,
  removeEmptyModuleImport,
  parseStrToArray,
} = require('./utils');
const { markDependency } = require('./utils/marker');

// handle forked antd
const commentOutStyleImport = [
  // antd/es/auto-complete/style
  /(es|lib)\/.+\/style.*/,
  // antd/dist/antd.compact.min.css
  /dist\/.+\.(less|css)/,
];

module.exports = (file, api, options) => {
  const j = api.jscodeshift;
  const root = j(file.source);
  const antdPkgNames = parseStrToArray(options.antdPkgNames || 'antd');

  // import 'antd/es/auto-complete/style';
  // import 'antd/dist/antd.compact.min.css';
  function removeStyleImport(j, root) {
    let hasChanged = false;

    const regexList = antdPkgNames.map(antdPkg => {
      return new RegExp(
        [
          antdPkg,
          `(${commentOutStyleImport.map(re => re.source).join('|')})`,
        ].join('/'),
      );
    });

    // import { Comment, PageHeader } from 'antd';
    // import { Comment, PageHeader } from '@forked/antd';
    root
      .find(j.ImportDeclaration)
      .filter(
        path =>
          path.node.source.type === 'StringLiteral' &&
          regexList.some(re => re.test(path.node.source.value)),
      )
      .forEach(path => {
        hasChanged = true;
        j(path).replaceWith(path => {
          // 不加空行会导致无法执行 root.toSource()
          const empty = j.emptyStatement();
          empty.comments = [j.commentLine(j(path.node).toSource())];
          return empty;
        });
      });

    return hasChanged;
  }

  // step1. import deprecated components from '@ant-design/compatible'
  // step2. cleanup antd import if empty
  let hasChanged = false;
  hasChanged = removeStyleImport(j, root) || hasChanged;

  return hasChanged
    ? root.toSource(options.printOptions || printOptions)
    : null;
};
