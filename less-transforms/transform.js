const postcss = require('postcss');
const lessSyntax = require('postcss-less');
const fs = require('fs');

const removeImport = require('./postcss-plugin-remove-antd-less');

exports.transform = async (content, opts = {}) => {
  const result = await postcss([removeImport]).process(content, {
    syntax: lessSyntax,
    ...opts,
  });
  return result.toString();
};

exports.transformFile = async filename => {
  const content = await fs.promises.readFile(filename, 'utf8');

  const result = exports.transform(content, { from: filename });

  return await fs.promises.writeFile(filename, result, 'utf8');
};
