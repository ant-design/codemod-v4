const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const papaparse = require('papaparse');

const encoding = 'utf8';

const summaryFilePath = path.join(
  require('os').tmpdir(),
  './antd4-codemod-summary.csv',
);

const newline = '\r\n';
const delimiter = ',,,';

const fsOpenAsync = promisify(fs.open);
const fsUnlinkAsync = promisify(fs.unlink);
const fsAppendFileAsync = promisify(fs.appendFile);

async function start() {
  return await fsOpenAsync(summaryFilePath, 'w');
}

async function appendLine(fileName, source, message) {
  const lineContent = [fileName, source, message].join(delimiter) + newline;
  return await fsAppendFileAsync(
    summaryFilePath,
    lineContent,
    encoding,
    Function.prototype,
  );
}

async function output() {
  const result = await new Promise((resolve, reject) => {
    const stream = fs.createReadStream(summaryFilePath);
    papaparse.parse(stream, {
      delimiter,
      newline,
      complete: ({ data, errors }) => {
        if (errors.length) {
          reject(errors.message);
        }

        resolve(data);
      },
    });
  });
  await cleanup();
  return result;
}

async function cleanup() {
  return await fsUnlinkAsync(summaryFilePath);
}

async function addIconRelatedMsg(file, location, source) {
  return await appendLine(
    `${file.path} - ${location.line}:${location.column}`,
    source,
    'Contains an invalid icon, please check it at https://ant.design/components/icon',
  );
}

module.exports = {
  start,
  appendLine,
  output,
  addIconRelatedMsg,
};
