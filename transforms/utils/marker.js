// markers for dependencies usage
const fs = require('fs');
const { promisify } = require('util');
const path = require('path');

const encoding = 'utf8';

const compatibleMarkerPath = path.join(
  require('os').tmpdir(),
  './ant-design-compatible-v5.marker.txt',
);

const dependencyMarkerPathMap = {
  '@ant-design/compatible': compatibleMarkerPath,
};

const fsOpenAsync = promisify(fs.open);
const fsUnlinkAsync = promisify(fs.unlink);
const fsAppendFileAsync = promisify(fs.appendFile);
const fsReadFileAsync = promisify(fs.readFile);

async function start() {
  return await Promise.all(
    Object.values(dependencyMarkerPathMap).map(markPath =>
      fsOpenAsync(markPath, 'w'),
    ),
  );
}

async function markDependency(dependency) {
  const markerPath = dependencyMarkerPathMap[dependency];
  if (markerPath) {
    // add times count
    await fsAppendFileAsync(markerPath, '1', encoding);
  }
}

async function output() {
  const dependencies = Object.keys(dependencyMarkerPathMap);
  const jobs = dependencies.map(async dependencyName => {
    const markerPath = dependencyMarkerPathMap[dependencyName];
    const content = await fsReadFileAsync(markerPath, encoding);
    const times = content.length;
    await fsUnlinkAsync(markerPath);
    return times;
  });
  const result = await Promise.all(jobs);
  return dependencies.reduce((prev, dependencyName, index) => {
    const times = result[index];
    if (times) {
      // eslint-disable-next-line no-param-reassign
      prev[dependencyName] = times;
    }

    return prev;
  }, {});
}

module.exports = {
  start,
  markDependency,
  output,
};
