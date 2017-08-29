const through = require('through2'),
  highland = require('highland'),
  util = require('./util');

/**
 * Returns a through stream that takes in module-deps objects
 * and emits global pack strings.
 * @param {object} [opts]
 * @param {string} [opts.scope='modules'] Property of window to contain modules
 * @returns {Stream} of JS strings
 */
function globalPack({scope = 'window.modules', objectMode = false} = {}) {
  const prelude = util.getPrelude(scope),
    postlude = util.getPostlude(scope);

  if (!objectMode) {
    return highland.pipeline(
      highland.through(transform(prelude, postlude, scope)),
      highland.map(dep => dep.content)
    );
  } else {
    return highland.pipeline(
      highland.through(transform(prelude, postlude, scope))
    );
  }
};

function transform(prelude, postlude, scope) {
  let first = true;

  return through.obj(function (dep, enc, cb) {
    const content = util.getModuleString(dep, scope);

    if (first) {
      this.push({
        id: 'prelude',
        content: prelude
      });;
      first = false;
    }
    this.push(Object.assign({}, dep, {
      content
    }));
    cb();
  }, function (cb) {
    this.push({
      id: 'postlude',
      content: postlude
    });
    cb();
  });
}


module.exports = globalPack;
