module.exports = {

  // Compile a drop index command.
  dropIndex: function(key) {
    return 'alter table ' + this._table() + ' drop index ' + key;
  },

  // Compile a drop foreign key command.
  dropForeign: function(key) {
    return 'alter table ' + this._table() + ' drop foreign key ' + key;
  },

  // Compile a drop primary key command.
  dropPrimary: function() {
    return 'alter table ' + this._table() + ' drop primary key';
  },

  // Compile a drop unique key command.
  dropUnique: function() {
    return this.dropIndex(builder, command);
  }

};