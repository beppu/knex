// MySQL Schema Types
// -------
module.exports = {
  increments: 'int unsigned not null auto_increment primary key',
  bigincrements: 'bigint unsigned not null auto_increment primary key',
  bigint: 'bigint',
  integer: function(length) {
    return 'int(' + (length || 11) + ')';
  },
  text: function(column) {
    switch (column) {
      case 'medium':
      case 'mediumtext':
        return 'mediumtext';
      case 'long':
      case 'longtext':
        return 'longtext';
      default:
        return 'text';
    }
  },
  mediumtext: function() {
    return this.text('medium');
  },
  longtext: function() {
    return this.text('long');
  },
  float: function(precision, scale) {
    return 'float(' + precision + ',' + scale + ')';
  },
  typeDecimal: function(precision, scale) {
    return 'decimal(' + precision + ', ' + scale + ')';
  },
  enu: function(allowed) {
    return "enum('" + allowed.join("', '")  + "')";
  },
  datetime: 'datetime',
  timestamp: 'timestamp',
  bit: function(length) {
    return length ? 'bit(' + length + ')' : 'bit';
  }
};