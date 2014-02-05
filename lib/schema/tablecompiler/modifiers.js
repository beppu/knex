// modifiers.js
// Used for designating additional column info
// during the table "create" / "alter" statements.

var Raw = require('../../raw');
var _   = require('lodash');

// NOTE: All methods are called with the context of the "TableCompiler" object.
module.exports = function() {

  return {

    nullable: function() {
      return ' null';
    },

    defaultTo: function(value) {
      if (value instanceof Raw) return value;
      if (this.stack[0].method === 'bool') {
        if (value === 'false') value = 0;
        value = (value ? 1 : 0);
      } else if (value === true || value === false) {
        value = parseInt(value, 10);
      } else {
        value = '' + value;
      }
      return value;
    }

  };

};