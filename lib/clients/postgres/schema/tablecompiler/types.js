// PostgreSQL Schema Types
// -------
module.exports = function() {
  return {
    bigincrements: 'bigserial primary key not null',
    bigint: 'bigint',
    binary: 'bytea',
    bit: function(column) {
      return column.length !== false ? 'bit(' + column.length + ')' : 'bit';
    },
    bool: 'boolean',
    datetime: 'timestamp',
    // Create the column definition for an enum type.
    // Using method "2" here: http://stackoverflow.com/a/10984951/525714
    enu: function(column) {
      return 'text check(' + this.wrap(column.name) + " in('" + column.allowed.join("', '")  + "'))";
    },
    floating: 'real',
    increments: 'serial primary key not null',
    // Create the column definition for a json type,
    // checking whether the json type is supported - falling
    // back to "text" if it's not.
    json: function() {
      if (parseFloat(builder.client.version) >= 9.2) return 'json';
      return 'text';
    },
    tinyint: 'smallint',
    timestamp: 'timestamp',
    uuid: 'uuid'
  };
};