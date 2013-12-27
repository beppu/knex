// WebSql Grammar
// -------
var _           = require('lodash');
var Helpers     = require('../../helpers').Helpers;
var baseGrammar = require('../sqlite3/grammar').grammar;

// Extends the base SQLite3 grammar, adding only the functions
// specific to the server.
module.exports = {

  compiler: require('./compiler'),

  // Ensures the response is returned in the same format as other clients.
  handleResponse: function(builder, resp) {
    if (builder.type === 'select') {
      var obj = [];
      for (var i = 0, l = resp.rows.length; i < l; i++) {
        obj[i] = _.clone(resp.rows.item(i));
      }
      return obj;
    } else if (builder.type === 'insert') {
      resp = [resp.insertId];
    } else if (builder.type === 'delete' || builder.type === 'update') {
      resp = resp.rowsAffected;
    }
    return resp;
  }

};