var Base = require('./index');

module.exports = function MySQL_Interface(){

  queryBuilder: require('./query/builder'),

  queryCompiler: require('./query/compiler')

};