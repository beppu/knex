// Common
// -------

// Some functions which are common to both the
// `Builder` and `SchemaBuilder` classes.
var _         = require('lodash');
var Helpers   = require('./helpers').Helpers;
var SqlString = require('./sqlstring').SqlString;

var Promise   = require('./promise').Promise;

var push      = [].push;

// Methods common to both the `Grammar` and `SchemaGrammar` interfaces,
// used to generate the sql in one form or another.
exports.Common = {

  // Sets the flag, so that when this object is passed into the
  // client adapter, we know to `log` the query.
  debug: function() {
    this.flags.debug = true;
    return this;
  },

  // Sets `options` which are passed along to the database client.
  options: function(opts) {
    this.flags.options = _.extend({}, this.flags.options, opts);
    return this;
  },

  // For those who dislike promise interfaces.
  // Multiple calls to `exec` will resolve with the same value
  // if called more than once. Any unhandled errors will be thrown
  // after the last block.
  exec: function(callback) {
    return this.then().nodeify(callback);
  },

  // The promise interface for the query builder.
  then: function(onFulfilled, onRejected) {
    if (!this._promise) {
      this._promise = Promise.bind(this);
      this._promise = this._promise.then(function() {
        return this.client.query(this);
      }).bind();
    }
    return this._promise.then(onFulfilled, onRejected);
  },

  // Explicitly sets the connection.
  connection: function(connection) {
    this.usingConnection = connection;
    return this;
  },

  // The connection the current query is being run on, optionally
  // specified by the `connection` method.
  usingConnection: false,

  // Default handler for a response is to pass it along.
  handleResponse: function(resp) {
    if (this && this.grammar && this.grammar.handleResponse) {
      return this.grammar.handleResponse(this, resp);
    }
    return resp;
  },

  // Returns all bindings excluding the `Knex.Raw` types.
  getBindings: function() {
    return this.grammar.getBindings(this);
  },

  // Sets the current Builder connection to that of the
  // the currently running transaction
  transacting: function(t) {
    if (t) {
      if (this.transaction) throw new Error('A transaction has already been set for the current query chain');
      var flags = this.flags;
      this.transaction = t;
      this.usingConnection = t.connection;
    }
    return this;
  }

};
