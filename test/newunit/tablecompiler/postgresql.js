describe("DatabasePostgresSchemaGrammarTest", function() {

  it("test basic create table", function() {
    var tableSql = new TableInterface('users', function(table) {
      table.increments('id');
      table.string('email');
    }).toSql('create', this.getGrammar());
    equal(1, tableSql.length);
    equal('create table "users" ("id" serial primary key, "email" varchar(255))', tableSql[0].sql);
  });

  it("test basic alter table", function() {
    var tableSql = new TableInterface('users', function(table) {
      table.increments('id');
      table.string('email');
    }).toSql('alter', this.getGrammar());
    equal(1, tableSql.length);
    equal('alter table "users" add column "id" serial primary key, add column "email" varchar(255)', tableSql[0].sql);
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

  it("test drop column", function() {
    var tableSql = new TableInterface('users', function(table) {
      table.dropColumn('foo');
    }).toSql('alter', this.getGrammar());
    equal(1, tableSql.length);
    equal('alter table "users" drop column "foo"', tableSql[0].sql);
  });

  it("test drop multiple columns", function() {
    var tableSql = new TableInterface('users', function(table) {
      table.dropColumn(['foo', 'bar']);
    }).toSql('alter', this.getGrammar());
    equal(1, tableSql.length);
    equal('alter table "users" drop column "foo", drop column "bar"', tableSql[0].sql);
  });

  it("test drop multiple columns with arguments", function() {
    var tableSql = new TableInterface('users', function(table) {
      table.dropColumn('foo', 'bar');
    }).toSql('alter', this.getGrammar());
    equal(1, tableSql.length);
    equal('alter table "users" drop column "foo", drop column "bar"', tableSql[0].sql);
  });

  it("test drop primary", function() {
    var tableSql = new TableInterface('users', function(table) {
      table.dropPrimary();
    }).toSql('alter', this.getGrammar());
    equal(1, tableSql.length);
    equal('alter table "users" drop constraint users_pkey', tableSql[0].sql);
  });

  it("test drop unique", function() {
    var tableSql = new TableInterface('users', function(table) {
      table.dropUnique('foo');
    }).toSql('alter', this.getGrammar());
    equal(1, tableSql.length);
    equal('alter table "users" drop constraint foo', tableSql[0].sql);
  });

  it("test drop index", function() {
    var tableSql = new TableInterface('users', function(table) {
      table.dropIndex('foo');
    }).toSql('alter', this.getGrammar());
    equal(1, tableSql.length);
    equal('drop index foo', tableSql[0].sql);
  });

  it("test drop foreign", function() {
    var tableSql = new TableInterface('users', function(table) {
      table.dropForeign('foo');
    }).toSql('alter', this.getGrammar());
    equal(1, tableSql.length);
    equal('alter table "users" drop constraint foo', tableSql[0].sql);
  });

  it("test drop timestamps", function() {
    var tableSql = new TableInterface('users', function(table) {
      table.dropTimestamps();
    }).toSql('alter', this.getGrammar());
    equal(1, tableSql.length);
    equal('alter table "users" drop column "created_at", drop column "updated_at"', tableSql[0].sql);
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
      table.primary('foo');
    }).toSql('alter', this.getGrammar());
    equal(1, tableSql.length);
    equal('alter table "users" add primary key ("foo")', tableSql[0].sql);
  });

  it("test adding foreign key", function() {
    throw new Error("Not implemented properly");
  });

  it("test adding unique key", function() {
    var tableSql = new TableInterface('users', function(table) {
      table.unique('foo', 'bar');
    }).toSql('alter', this.getGrammar());
    equal(1, tableSql.length);
    equal('alter table "users" add constraint bar unique ("foo")', tableSql[0].sql);
  });

  it("test adding index", function() {
    var tableSql = new TableInterface('users', function(table) {
      table.index(['foo', 'bar'], 'baz');
    }).toSql('alter', this.getGrammar());
    equal(1, tableSql.length);
    equal('create index baz on "users" ("foo", "bar")', tableSql[0].sql);
  });

  it("test adding incrementing i d", function() {
    var tableSql = new TableInterface('users', function(table) {
      table.increments('id');
    }).toSql('alter', this.getGrammar());
    equal(1, tableSql.length);
    equal('alter table "users" add column "id" serial primary key', tableSql[0].sql);
  });

  it("test adding big incrementing id", function() {
    var tableSql = new TableInterface('users', function(table) {
      table.bigIncrements('id');
    }).toSql('alter', this.getGrammar());
    equal(1, tableSql.length);
    equal('alter table "users" add column "id" bigserial primary key', tableSql[0].sql);
  });

  it("test adding string", function() {
    var tableSql = new TableInterface('users', function(table) {
      table.string('foo');
    }).toSql('alter', this.getGrammar());
    equal(1, tableSql.length);
    equal('alter table "users" add column "foo" varchar(255)', tableSql[0].sql);
  });

  it("test adding varchar with length", function() {
    var tableSql = new TableInterface('users', function(table) {
      table.string('foo', 100);
    }).toSql('alter', this.getGrammar());
    equal(1, tableSql.length);
    equal('alter table "users" add column "foo" varchar(100)', tableSql[0].sql);
  });

  it("test adding a string with a default", function() {
    var tableSql = new TableInterface('users', function(table) {
      table.string('foo', 100).defaultTo('bar');
    }).toSql('alter', this.getGrammar());
    equal(1, tableSql.length);
    equal('alter table "users" add column "foo" varchar(100) default \'bar\'', tableSql[0].sql);
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
    equal('alter table "users" add column "foo" bigint', tableSql[0].sql);
  });

  it("tests a big integer as the primary autoincrement key", function() {
    var tableSql = new TableInterface('users', function(table) {
      table.bigInteger('foo', true);
    }).toSql('alter', this.getGrammar());
    equal(1, tableSql.length);
    equal('alter table "users" add column "foo" bigserial primary key', tableSql[0].sql);
  });

  it("test adding integer", function() {
    var tableSql = new TableInterface('users', function(table) {
      table.integer('foo');
    }).toSql('alter', this.getGrammar());
    equal(1, tableSql.length);
    equal('alter table "users" add column "foo" integer', tableSql[0].sql);
  });

  it("test adding autoincrement integer", function() {
    var tableSql = new TableInterface('users', function(table) {
      table.integer('foo', true);
    }).toSql('alter', this.getGrammar());
    equal(1, tableSql.length);
    equal('alter table "users" add column "foo" serial primary key', tableSql[0].sql);
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
    equal('alter table "users" add column "foo" smallint', tableSql[0].sql);
  });

  it("test adding small integer", function() {
    var tableSql = new TableInterface('users', function(table) {
      table.smallInteger('foo');
    }).toSql('alter', this.getGrammar());
    equal(1, tableSql.length);
    equal('alter table "users" add column "foo" smallint', tableSql[0].sql);
  });

  it("test adding float", function() {
    var tableSql = new TableInterface('users', function(table) {
      table.float('foo', 5, 2);
    }).toSql('alter', this.getGrammar());
    equal(1, tableSql.length);
    equal('alter table "users" add column "foo" real', tableSql[0].sql);
  });

  it("test adding double", function() {
    var tableSql = new TableInterface('users', function(table) {
      table.double('foo', 15, 8);
    }).toSql('alter', this.getGrammar());
    equal(1, tableSql.length);
    equal('alter table "users" add column "foo" double precision', tableSql[0].sql);
  });

  it("test adding decimal", function() {
    var tableSql = new TableInterface('users', function(table) {
      table.decimal('foo', 5, 2);
    }).toSql('alter', this.getGrammar());
    equal(1, tableSql.length);
    equal('alter table "users" add column "foo" decimal(5, 2)', tableSql[0].sql);
  });

  it("test adding boolean", function() {
    var tableSql = new TableInterface('users', function(table) {
      table.boolean('foo');
    }).toSql('alter', this.getGrammar());
    equal(1, tableSql.length);
    equal('alter table "users" add column "foo" boolean', tableSql[0].sql);
  });

  it("test adding enum", function() {
    var tableSql = new TableInterface('users', function(table) {
      table.enum('foo', ['bar', 'baz']);
    }).toSql('alter', this.getGrammar());
    equal(1, tableSql.length);
    equal('alter table "users" add column "foo" varchar(255) check (foo in (\'bar\', \'baz\'))', tableSql[0].sql);
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
    equal('alter table "users" add column "foo" timestamp', tableSql[0].sql);
  });

  it("test adding time", function() {
    var tableSql = new TableInterface('users', function(table) {
      table.time('foo');
    }).toSql('alter', this.getGrammar());
    equal(1, tableSql.length);
    equal('alter table "users" add column "foo" time', tableSql[0].sql);
  });

  it("test adding timestamp", function() {
    var tableSql = new TableInterface('users', function(table) {
      table.timestamp('foo');
    }).toSql('alter', this.getGrammar());
    equal(1, tableSql.length);
    equal('alter table "users" add column "foo" timestamp', tableSql[0].sql);
  });

  it("test adding timestamps", function() {
    var tableSql = new TableInterface('users', function(table) {
      table.timestamps();
    }).toSql('alter', this.getGrammar());
    equal(1, tableSql.length);
    equal('alter table "users" add column "created_at" timestamp, add column "updated_at" timestamp', tableSql[0].sql);
  });

  it("test adding binary", function() {
    var tableSql = new TableInterface('users', function(table) {
      table.binary('foo');
    }).toSql('alter', this.getGrammar());
    equal(1, tableSql.length);
    equal('alter table "users" add column "foo" bytea', tableSql[0].sql);
  });

});