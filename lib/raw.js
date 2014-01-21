// Raw
// -------
var _ = require('lodash');

var Raw = module.exports = function(sql, bindings) {
  this.sql = sql;
  this.bindings = bindings;
};

Raw.prototype = {

  _source: 'Raw',

  // Set the sql and the bindings associated with the query, returning
  // the current raw object.
  query: function(sql, bindings) {
    this.bindings = _.isArray(bindings) ? bindings :
      bindings ? [bindings] : [];
    this.sql = sql;
    return this;
  },

  // Returns the raw sql for the query.
  toSql: function() {
    return this.sql;
  }

};