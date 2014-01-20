// MySQL Grammar
// -------
var _           = require('lodash');
var Helpers     = require('../../helpers');

// Extends the standard sql grammar.
module.exports = {

  compiler: require('./compiler'),

  // The keyword identifier wrapper format.
  wrapValue: function(value) {
    return (value !== '*' ? Helpers.format('`%s`', value) : "*");
  },

  // Ensures the response is returned in the same format as other clients.
  handleResponse: function(builder, response) {
    response = response[0];
    if (builder.type === 'select') response = Helpers.skim(response);
    if (builder.type === 'insert') response = [response.insertId];
    if (builder.type === 'delete' || builder.type === 'update') response = response.affectedRows;
    return response;
  },

  // Adds a `for update` clause to the query, relevant with transactions.
  forUpdate: function() {
    return this.statements.push({
      type: 'lock',
      value: 'for update'
    });
  },

  // Adds a `for share` clause to the query, relevant with transactions.
  forShare: function() {
    return this.statements.push({
      type: 'lock',
      value: 'lock in share mode'
    });
  }

};