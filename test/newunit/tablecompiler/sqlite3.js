describe("DatabaseSQLiteSchemaGrammarTest", function() {

  it("test basic create table", function() {
    var tableSql = new TableInterface('users', function(table) {
      table.create();
      table.increments('id');
      table.string('email');
    }).toSql('create', this.getGrammar());

    equal(1, tableSql.length);
    equal('create table "users" ("id" integer not null primary key autoincrement, "email" varchar)', tableSql[0].sql);
  });

  it("", function() {
    var tableSql = new TableInterface('users', function(table) {
      table.increments('id');
      table.string('email');
    }).toSql('alter', this.getGrammar());

    equal(2, tableSql.length);
    var expected = [
      'alter table "users" add column "id" integer not null primary key autoincrement',
      'alter table "users" add column "email" varchar',
    ];
    deepEqual(expected, _.pluck(tableSql, 'sql'));
  });

  it("test drop table", function() {
    var tableSql = new TableInterface('users', function(table) {
      table.drop();
    }).toSql('alter', this.getGrammar());

    equal(1, tableSql.length);
    equal('drop table "users"', tableSql[0].sql);
  });

  it("test drop table if exists", function() {
    var tableSql = new TableInterface('users', function(table) {
      table.dropIfExists();
    }).toSql('alter', this.getGrammar());

    equal(1, tableSql.length);
    equal('drop table if exists "users"', tableSql[0].sql);
  });

  it("test drop unique", function() {
    var tableSql = new TableInterface('users', function(table) {
      table.dropUnique('foo');
    }).toSql('alter', this.getGrammar());

    equal(1, tableSql.length);
    equal('drop index foo', tableSql[0].sql);
  });

  it("test drop index", function() {
    var tableSql = new TableInterface('users', function(table) {
      table.dropIndex('foo');
    }).toSql('alter', this.getGrammar());

    equal(1, tableSql.length);
    equal('drop index foo', tableSql[0].sql);
  });

  it("test rename table", function() {
    var tableSql = new TableInterface('users', function(table) {
      table.rename('foo');
    }).toSql('alter', this.getGrammar());

    equal(1, tableSql.length);
    equal('alter table "users" rename to "foo"', tableSql[0].sql);
  });

  it("test adding primary key", function() {
    var tableSql = new TableInterface('users', function(table) {
      table.create();
      table.string('foo').primary();
    }).toSql('alter', this.getGrammar());

    equal(1, tableSql.length);
    equal('create table "users" ("foo" varchar, primary key ("foo"))', tableSql[0].sql);
  });

  it("test adding foreign key", function() {
    var tableSql = new TableInterface('users', function(table) {
      table.create();
      table.string('foo').primary();
      table.string('order_id');
      table.foreign('order_id').references('id').on('orders');
    }).toSql('alter', this.getGrammar());

    equal(1, tableSql.length);
    equal('create table "users" ("foo" varchar, "order_id" varchar, foreign key("order_id") references "orders"("id"), primary key ("foo"))', tableSql[0].sql);
  });

  it("test adding unique key", function() {
    var tableSql = new TableInterface('users', function(table) {
      table.unique('foo', 'bar');
    }).toSql('alter', this.getGrammar());

    equal(1, tableSql.length);
    equal('create unique index bar on "users" ("foo")', tableSql[0].sql);
  });

  it("test adding index", function() {
    var tableSql = new TableInterface('users', function(table) {
      table.index(['foo', 'bar'], 'baz');
    }).toSql('alter', this.getGrammar());

    equal(1, tableSql.length);
    equal('create index baz on "users" ("foo", "bar")', tableSql[0].sql);
  });

  it("test adding incrementing id", function() {
    var tableSql = new TableInterface('users', function(table) {
      table.increments('id');
    }).toSql('alter', this.getGrammar());

    equal(1, tableSql.length);
    equal('alter table "users" add column "id" integer not null primary key autoincrement', tableSql[0].sql);
  });

  it("test adding big incrementing id", function() {
    var tableSql = new TableInterface('users', function(table) {
      table.bigIncrements('id');
    }).toSql('alter', this.getGrammar());

    equal(1, tableSql.length);
    equal('alter table "users" add column "id" integer not null primary key autoincrement', tableSql[0].sql);
  });

  it("test adding string", function() {
    var tableSql = new TableInterface('users', function(table) {
      table.string('foo');
    }).toSql('alter', this.getGrammar());

    equal(1, tableSql.length);
    equal('alter table "users" add column "foo" varchar', tableSql[0].sql);
  });

  it("", function() {
    var tableSql = new TableInterface('users', function(table) {
      table.string('foo', 100);
    }).toSql('alter', this.getGrammar());

    equal(1, tableSql.length);
    equal('alter table "users" add column "foo" varchar', tableSql[0].sql);
  });

  it("", function() {
    var tableSql = new TableInterface('users', function(table) {
      table.string('foo', 100).nullable().
      default ('bar');
    }).toSql('alter', this.getGrammar());

    equal(1, tableSql.length);
    equal('alter table "users" add column "foo" varchar null default \'bar\'', tableSql[0].sql);
  });

  it("test adding text", function() {
    var tableSql = new TableInterface('users', function(table) {
      table.text('foo');
    }).toSql('alter', this.getGrammar());

    equal(1, tableSql.length);
    equal('alter table "users" add column "foo" text', tableSql[0].sql);
  });

  it("test adding big integer", function() {
    var tableSql = new TableInterface('users', function(table) {
      table.bigInteger('foo');
    }).toSql('alter', this.getGrammar());

    equal(1, tableSql.length);
    equal('alter table "users" add column "foo" integer', tableSql[0].sql);
  });

  it("", function() {
    var tableSql = new TableInterface('users', function(table) {
      table.bigInteger('foo', true);
    }).toSql('alter', this.getGrammar());

    equal(1, tableSql.length);
    equal('alter table "users" add column "foo" integer not null primary key autoincrement', tableSql[0].sql);
  });

  it("test adding integer", function() {
    var tableSql = new TableInterface('users', function(table) {
      table.integer('foo');
    }).toSql('alter', this.getGrammar());

    equal(1, tableSql.length);
    equal('alter table "users" add column "foo" integer', tableSql[0].sql);
  });

  it("", function() {
    var tableSql = new TableInterface('users', function(table) {
      table.integer('foo', true);
    }).toSql('alter', this.getGrammar());

    equal(1, tableSql.length);
    equal('alter table "users" add column "foo" integer not null primary key autoincrement', tableSql[0].sql);
  });

  it("test adding medium integer", function() {
    var tableSql = new TableInterface('users', function(table) {
      table.mediumInteger('foo');
    }).toSql('alter', this.getGrammar());

    equal(1, tableSql.length);
    equal('alter table "users" add column "foo" integer', tableSql[0].sql);
  });

  it("test adding tiny integer", function() {
    var tableSql = new TableInterface('users', function(table) {
      table.tinyInteger('foo');
    }).toSql('alter', this.getGrammar());

    equal(1, tableSql.length);
    equal('alter table "users" add column "foo" integer', tableSql[0].sql);
  });

  it("test adding small integer", function() {
    var tableSql = new TableInterface('users', function(table) {
      table.smallInteger('foo');
    }).toSql('alter', this.getGrammar());

    equal(1, tableSql.length);
    equal('alter table "users" add column "foo" integer', tableSql[0].sql);
  });

  it("test adding float", function() {
    var tableSql = new TableInterface('users', function(table) {
      table.float('foo', 5, 2);
    }).toSql('alter', this.getGrammar());

    equal(1, tableSql.length);
    equal('alter table "users" add column "foo" float', tableSql[0].sql);
  });

  it("test adding double", function() {
    var tableSql = new TableInterface('users', function(table) {
      table.double('foo', 15, 8);
    }).toSql('alter', this.getGrammar());

    equal(1, tableSql.length);
    equal('alter table "users" add column "foo" float', tableSql[0].sql);
  });

  it("test adding decimal", function() {
    var tableSql = new TableInterface('users', function(table) {
      table.decimal('foo', 5, 2);
    }).toSql('alter', this.getGrammar());

    equal(1, tableSql.length);
    equal('alter table "users" add column "foo" float', tableSql[0].sql);
  });

  it("test adding boolean", function() {
    var tableSql = new TableInterface('users', function(table) {
      table.boolean('foo');
    }).toSql('alter', this.getGrammar());

    equal(1, tableSql.length);
    equal('alter table "users" add column "foo" tinyint', tableSql[0].sql);
  });

  it("test adding enum", function() {
    var tableSql = new TableInterface('users', function(table) {
      table.enum('foo', ['bar', 'baz']);
    }).toSql('alter', this.getGrammar());

    equal(1, tableSql.length);
    equal('alter table "users" add column "foo" varchar', tableSql[0].sql);
  });

  it("test adding date", function() {
    var tableSql = new TableInterface('users', function(table) {
      table.date('foo');
    }).toSql('alter', this.getGrammar());

    equal(1, tableSql.length);
    equal('alter table "users" add column "foo" date', tableSql[0].sql);
  });

  it("test adding date time", function() {
    var tableSql = new TableInterface('users', function(table) {
      table.dateTime('foo');
    }).toSql('alter', this.getGrammar());

    equal(1, tableSql.length);
    equal('alter table "users" add column "foo" datetime', tableSql[0].sql);
  });

  it("test adding time", function() {
    var tableSql = new TableInterface('users', function(table) {
      table.time('foo');
    }).toSql('alter', this.getGrammar());

    equal(1, tableSql.length);
    equal('alter table "users" add column "foo" time', tableSql[0].sql);
  });

  it("test adding time stamp", function() {
    var tableSql = new TableInterface('users', function(table) {
      table.timestamp('foo');
    }).toSql('alter', this.getGrammar());

    equal(1, tableSql.length);
    equal('alter table "users" add column "foo" datetime', tableSql[0].sql);
  });

  it("test adding time stamps", function() {
    var tableSql = new TableInterface('users', function(table) {
      table.timestamps();
    }).toSql('alter', this.getGrammar());

    equal(2, tableSql.length);
    var expected = [
      'alter table "users" add column "created_at" datetime',
      'alter table "users" add column "updated_at" datetime'
    ];
    deepEqual(expected, _.pluck(tableSql, 'sql'));
  });

  it("test adding binary", function() {
    var tableSql = new TableInterface('users', function(table) {
      table.binary('foo');
    }).toSql('alter', this.getGrammar());

    equal(1, tableSql.length);
    equalthis.assertEquals('alter table "users" add column "foo" blob', tableSql[0].sql);
  });

});