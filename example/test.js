const input = require('./input.json'),
  globalPack = require('../index'),
  highland = require('highland'),
  fs = require('fs'),
  pathUtil = require('path'),
  writeFile = highland.wrapCallback(fs.writeFile);

let i = 0;
const ids = [];

highland(input)
  .map((dep) => {
    ids.push(dep.id);
    return dep;
  })
  .through(globalPack())
  .flatMap((str) => {
    const filename = (i ? (ids[i-1] || 'postlude') : 'prelude') + '.js',
      outpath = pathUtil.join(__dirname, 'bundle', filename);

    i++;
    return writeFile(outpath, str)
  })
  .toArray((results) => {
    console.log(results);
  });
