const through = require('through2'),
  util = require('./util');

/**
 * Returns a through stream that takes in module-deps objects
 * and emits global pack strings.
 * @param {object} [opts]
 * @param {string} [opts.scope='modules'] Property of window to contain modules
 * @returns {Stream}
 */
function globalPack({scope = 'window.modules'} = {}) {
  const prelude = util.getPrelude(scope),
    postlude = util.getPostlude(scope);
  let first = true;

  return through.obj(function (dep, enc, cb) {
    if (first) {
      this.push(prelude);
      first = false;
    }
    this.push(util.getModuleString(dep, scope));
    cb();
  }, function (cb) {
    this.push(postlude);
    cb();
  });
};

module.exports = globalPack;
