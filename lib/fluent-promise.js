// Fluent Promise

// Used to create a "thennable" out of a traditional object,
// rather than forcing an object to be coerced into a promise when calling
// a particular method. Useful for chainable api's.
module.exports = function(targetProto, thennable) {

  Promise = require('./promise');

  _.each(['catch', 'caught', 'tap', 'lastly', 'finally', 'exec', 'nodeify'], function(key) {
    targetProto[key] = function() {
      var promise = this.then();
      return promise[key].apply(promise, arguments);
    };
  });

};