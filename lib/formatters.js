// Mixed into the query compiler & schema pieces. Assumes a `grammar`
// property exists on the current object.
var _   = require('lodash');
var Raw = require('./raw');

module.exports = {

  // Puts the appropriate wrapper around a value depending on the database
  // engine, unless it's a knex.raw value, in which case it's left alone.
  _wrap: function formatters$wrap(val) {
    var raw, segments;
    if (raw = this._checkRaw(val)) return raw;
    if (_.isNumber(val)) return val;

    // Coerce to string to prevent strange errors when it's not a string.
    var value = val + '';
    var asIndex = value.toLowerCase().indexOf(' as ');
    if (asIndex !== -1) {
      segments = value.split(' as ');
      return this._wrap(segments[0]) + ' as ' + this._wrap(segments[1]);
    }
    var wrapped = [];
    segments = value.split('.');
    for (var i = 0, l = segments.length; i < l; i = ++i) {
      value = segments[i];
      if (i === 0 && segments.length > 1) {
        wrapped.push(this._wrap(value));
      } else {
        wrapped.push(this._wrapValue(value));
      }
    }
    return wrapped.join('.');
  },

  // Accepts an array of columns to wrap as appropriate.
  _columnize: function formatters$columnize(columns) {
    return _.map(columns, this._wrap, this).join(', ');
  },

  _checkRaw: function formatters$checkRaw(value, parameter) {
    if (value instanceof Raw) {
      if (value.bindings) this.binding.push(value.bindings);
      return value.sql;
    }
    if (parameter) this.binding.push(value);
  }

};