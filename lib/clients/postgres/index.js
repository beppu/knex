var Helpers = require('../../helpers');

module.exports = {

  // The keyword identifier wrapper format.
  wrapValue: function(value) {
    return (value !== '*' ? Helpers.format('"%s"', value) : "*");
  },

  queryBuilder: require('./query/builder'),

  queryCompiler: require('./query/compiler')

};