const fs = require('fs');
const path = require('path');
const papaparse = require('papaparse');

const encoding = 'utf8';

const summaryFilePath = path.join(
  require('os').tmpdir(),
  './antd4-codemod-summary.csv',
);

const newline = '\r\n';
const delimiter = ',,,';

function start() {
  fs.openSync(summaryFilePath, 'w');
}

function appendLine(fileName, source, message) {
  const lineContent = [fileName, source, message].join(delimiter) + newline;
  fs.appendFile(summaryFilePath, lineContent, encoding, Function.prototype);
}

async function output() {
  return new Promise((resolve, reject) => {
    const stream = fs.createReadStream(summaryFilePath);
    papaparse.parse(stream, {
      delimiter,
      newline,
      complete: ({ data, errors }) => {
        cleanup();
        if (errors.length) {
          reject(errors.message);
        }

        resolve(data);
      },
    });
  });
}

function cleanup() {
  fs.unlinkSync(summaryFilePath);
}

module.exports = {
  start,
  appendLine,
  output,
};
