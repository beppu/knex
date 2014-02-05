// Common
// -------

// Some functions which are common to both the
// `Builder` and `SchemaBuilder` classes.
var _         = require('lodash');

var Helpers   = require('./helpers');
var SqlString = require('./sqlstring');

// Methods common to both the `Grammar` and `SchemaGrammar` interfaces,
// used to generate the sql in one form or another.
module.exports = {

  // Sets `options` which are passed along to the database client.
  options: function(opts) {
    this.flags.options = _.extend({}, this.flags.options, opts);
    return this;
  },

  // Explicitly sets the connection.
  connection: function(connection) {
    this.usingConnection = connection;
    return this;
  },

  // The connection the current query is being run on, optionally
  // specified by the `connection` method.
  usingConnection: false,

  // Sets the current Builder connection to that of the
  // the currently running transaction.
  transacting: function(t) {
    if (t) {
      if (this.__transaction) {
        throw new Error('A transaction has already been set for the current query chain');
      }
      var flags = this.flags;
      this.__transaction = t;
      this.usingConnection = t.connection;
    }
    return this;
  }

};
