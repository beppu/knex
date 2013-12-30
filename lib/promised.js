var _       = require('lodash');
var Promise = require('./promise');

module.exports = function(Target) {

  // Loop over the appropriate promise methods and attach them onto the
  // "Target" object's prototype.
  _.forOwn(Promise.prototype, function(fn, method) {

    // Attach all relevant public functions from the
    if (_.isFunction(fn) && method[0] !== '_' && method !== 'then') {
      Target.prototype[method] = function() {
        var promise = this.then();
        return promise[method].apply(this, arguments);
      };
    }

  });

  // The "then" calls a special method, "_coerceable"
  // which "coerces" the object into a new promise and then calls
  // a real "then" with the arguments.
  Target.prototype.then = Promise.method(function() {
    var promise = this.coerceable();
    return promise.then.apply(promise, arguments);
  });

  return Target;
};