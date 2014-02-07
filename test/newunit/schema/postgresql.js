module.exports = function(client) {

  client.initSchema();

  var SchemaBuilder = client.SchemaBuilder;
  var _ = require('lodash');
  var equal = require('assert').equal;
  var deepEqual = require('assert').deepEqual;

  describe("PostgreSQL SchemaBuilder", function() {

    it("basic create table", function() {
      var tableSql = new SchemaBuilder().createTable('users', function(table) {
        table.increments('id');
        table.string('email');
      }).toSql();
      equal(1, tableSql.length);
      expect(tableSql[0].sql).to.equal('create table "users" ("id" serial primary key, "email" varchar(255))');
    });

    it("basic alter table", function() {
      var tableSql = new SchemaBuilder().table('users', function(table) {
        table.increments('id');
        table.string('email');
      }).toSql();
      equal(1, tableSql.length);
      expect(tableSql[0].sql).to.equal('alter table "users" add column "id" serial primary key, add column "email" varchar(255)');
    });

    it("drop table", function() {
      var tableSql = new SchemaBuilder().dropTable('users').toSql();
      equal(1, tableSql.length);
      expect(tableSql[0].sql).to.equal('drop table "users"');
    });

    it("drop table if exists", function() {
      var tableSql = new SchemaBuilder().dropTableIfExists('users').toSql();
      equal(1, tableSql.length);
      expect(tableSql[0].sql).to.equal('drop table if exists "users"');
    });

    it("drop column", function() {
      var tableSql = new SchemaBuilder().table('users', function(table) {
        table.dropColumn('foo');
      }).toSql();
      equal(1, tableSql.length);
      expect(tableSql[0].sql).to.equal('alter table "users" drop column "foo"');
    });

    it("drop multiple columns", function() {
      var tableSql = new SchemaBuilder().table('users', function(table) {
        table.dropColumn(['foo', 'bar']);
      }).toSql();
      equal(1, tableSql.length);
      expect(tableSql[0].sql).to.equal('alter table "users" drop column "foo", drop column "bar"');
    });

    it("drop multiple columns with arguments", function() {
      var tableSql = new SchemaBuilder().table('users', function(table) {
        table.dropColumn('foo', 'bar');
      }).toSql();
      equal(1, tableSql.length);
      expect(tableSql[0].sql).to.equal('alter table "users" drop column "foo", drop column "bar"');
    });

    it("drop primary", function() {
      var tableSql = new SchemaBuilder().table('users', function(table) {
        table.dropPrimary();
      }).toSql();
      equal(1, tableSql.length);
      expect(tableSql[0].sql).to.equal('alter table "users" drop constraint users_pkey');
    });

    it("drop unique", function() {
      var tableSql = new SchemaBuilder().table('users', function(table) {
        table.dropUnique('foo');
      }).toSql();
      equal(1, tableSql.length);
      expect(tableSql[0].sql).to.equal('alter table "users" drop constraint foo');
    });

    it("drop index", function() {
      var tableSql = new SchemaBuilder().table('users', function(table) {
        table.dropIndex('foo');
      }).toSql();
      equal(1, tableSql.length);
      expect(tableSql[0].sql).to.equal('drop index foo');
    });

    it("drop foreign", function() {
      var tableSql = new SchemaBuilder().table('users', function(table) {
        table.dropForeign('foo');
      }).toSql();
      equal(1, tableSql.length);
      expect(tableSql[0].sql).to.equal('alter table "users" drop constraint foo');
    });

    it("drop timestamps", function() {
      var tableSql = new SchemaBuilder().table('users', function(table) {
        table.dropTimestamps();
      }).toSql();
      equal(1, tableSql.length);
      expect(tableSql[0].sql).to.equal('alter table "users" drop column "created_at", drop column "updated_at"');
    });

    it("rename table", function() {
      var tableSql = new SchemaBuilder().renameTable('users', 'foo').toSql();
      equal(1, tableSql.length);
      expect(tableSql[0].sql).to.equal('alter table "users" rename to "foo"');
    });

    it("adding primary key", function() {
      var tableSql = new SchemaBuilder().table('users', function(table) {
        table.primary('foo');
      }).toSql();
      equal(1, tableSql.length);
      expect(tableSql[0].sql).to.equal('alter table "users" add primary key ("foo")');
    });

    it("adding foreign key");

    it("adding unique key", function() {
      var tableSql = new SchemaBuilder().table('users', function(table) {
        table.unique('foo', 'bar');
      }).toSql();
      equal(1, tableSql.length);
      expect(tableSql[0].sql).to.equal('alter table "users" add constraint bar unique ("foo")');
    });

    it("adding index", function() {
      var tableSql = new SchemaBuilder().table('users', function(table) {
        table.index(['foo', 'bar'], 'baz');
      }).toSql();
      equal(1, tableSql.length);
      expect(tableSql[0].sql).to.equal('create index baz on "users" ("foo", "bar")');
    });

    it("adding incrementing i d", function() {
      var tableSql = new SchemaBuilder().table('users', function(table) {
        table.increments('id');
      }).toSql();
      equal(1, tableSql.length);
      expect(tableSql[0].sql).to.equal('alter table "users" add column "id" serial primary key');
    });

    it("adding big incrementing id", function() {
      var tableSql = new SchemaBuilder().table('users', function(table) {
        table.bigIncrements('id');
      }).toSql();
      equal(1, tableSql.length);
      expect(tableSql[0].sql).to.equal('alter table "users" add column "id" bigserial primary key');
    });

    it("adding string", function() {
      var tableSql = new SchemaBuilder().table('users', function(table) {
        table.string('foo');
      }).toSql();
      equal(1, tableSql.length);
      expect(tableSql[0].sql).to.equal('alter table "users" add column "foo" varchar(255)');
    });

    it("adding varchar with length", function() {
      var tableSql = new SchemaBuilder().table('users', function(table) {
        table.string('foo', 100);
      }).toSql();
      equal(1, tableSql.length);
      expect(tableSql[0].sql).to.equal('alter table "users" add column "foo" varchar(100)');
    });

    it("adding a string with a default", function() {
      var tableSql = new SchemaBuilder().table('users', function(table) {
        table.string('foo', 100).defaultTo('bar');
      }).toSql();
      equal(1, tableSql.length);
      expect(tableSql[0].sql).to.equal('alter table "users" add column "foo" varchar(100) default \'bar\'');
    });

    it("adding text", function() {
      var tableSql = new SchemaBuilder().table('users', function(table) {
        table.text('foo');
      }).toSql();
      equal(1, tableSql.length);
      expect(tableSql[0].sql).to.equal('alter table "users" add column "foo" text');
    });

    it("adding big integer", function() {
      var tableSql = new SchemaBuilder().table('users', function(table) {
        table.bigInteger('foo');
      }).toSql();
      equal(1, tableSql.length);
      expect(tableSql[0].sql).to.equal('alter table "users" add column "foo" bigint');
    });

    it("tests a big integer as the primary autoincrement key", function() {
      var tableSql = new SchemaBuilder().table('users', function(table) {
        table.bigIncrements('foo');
      }).toSql();
      equal(1, tableSql.length);
      expect(tableSql[0].sql).to.equal('alter table "users" add column "foo" bigserial primary key');
    });

    it("adding integer", function() {
      var tableSql = new SchemaBuilder().table('users', function(table) {
        table.integer('foo');
      }).toSql();
      equal(1, tableSql.length);
      expect(tableSql[0].sql).to.equal('alter table "users" add column "foo" integer');
    });

    it("adding autoincrement integer", function() {
      var tableSql = new SchemaBuilder().table('users', function(table) {
        table.increments('foo');
      }).toSql();
      equal(1, tableSql.length);
      expect(tableSql[0].sql).to.equal('alter table "users" add column "foo" serial primary key');
    });

    it("adding medium integer", function() {
      var tableSql = new SchemaBuilder().table('users', function(table) {
        table.mediumint('foo');
      }).toSql();
      equal(1, tableSql.length);
      expect(tableSql[0].sql).to.equal('alter table "users" add column "foo" integer');
    });

    it("adding tiny integer", function() {
      var tableSql = new SchemaBuilder().table('users', function(table) {
        table.tinyint('foo');
      }).toSql();
      equal(1, tableSql.length);
      expect(tableSql[0].sql).to.equal('alter table "users" add column "foo" smallint');
    });

    it("adding small integer", function() {
      var tableSql = new SchemaBuilder().table('users', function(table) {
        table.smallint('foo');
      }).toSql();
      equal(1, tableSql.length);
      expect(tableSql[0].sql).to.equal('alter table "users" add column "foo" smallint');
    });

    it("adding float", function() {
      var tableSql = new SchemaBuilder().table('users', function(table) {
        table.float('foo', 5, 2);
      }).toSql();
      equal(1, tableSql.length);
      expect(tableSql[0].sql).to.equal('alter table "users" add column "foo" real');
    });

    it("adding double", function() {
      var tableSql = new SchemaBuilder().table('users', function(table) {
        table.double('foo', 15, 8);
      }).toSql();
      equal(1, tableSql.length);
      expect(tableSql[0].sql).to.equal('alter table "users" add column "foo" double precision');
    });

    it("adding decimal", function() {
      var tableSql = new SchemaBuilder().table('users', function(table) {
        table.decimal('foo', 5, 2);
      }).toSql();
      equal(1, tableSql.length);
      expect(tableSql[0].sql).to.equal('alter table "users" add column "foo" decimal(5, 2)');
    });

    it("adding boolean", function() {
      var tableSql = new SchemaBuilder().table('users', function(table) {
        table.boolean('foo');
      }).toSql();
      equal(1, tableSql.length);
      expect(tableSql[0].sql).to.equal('alter table "users" add column "foo" boolean');
    });

    it("adding enum", function() {
      var tableSql = new SchemaBuilder().table('users', function(table) {
        table.enum('foo', ['bar', 'baz']);
      }).toSql();
      equal(1, tableSql.length);
      expect(tableSql[0].sql).to.equal('alter table "users" add column "foo" text check (foo in (\'bar\', \'baz\'))');
    });

    it("adding date", function() {
      var tableSql = new SchemaBuilder().table('users', function(table) {
        table.date('foo');
      }).toSql();
      equal(1, tableSql.length);
      expect(tableSql[0].sql).to.equal('alter table "users" add column "foo" date');
    });

    it("adding date time", function() {
      var tableSql = new SchemaBuilder().table('users', function(table) {
        table.dateTime('foo');
      }).toSql();
      equal(1, tableSql.length);
      expect(tableSql[0].sql).to.equal('alter table "users" add column "foo" timestamp');
    });

    it("adding time", function() {
      var tableSql = new SchemaBuilder().table('users', function(table) {
        table.time('foo');
      }).toSql();
      equal(1, tableSql.length);
      expect(tableSql[0].sql).to.equal('alter table "users" add column "foo" time');
    });

    it("adding timestamp", function() {
      var tableSql = new SchemaBuilder().table('users', function(table) {
        table.timestamp('foo');
      }).toSql();
      equal(1, tableSql.length);
      expect(tableSql[0].sql).to.equal('alter table "users" add column "foo" timestamp');
    });

    it("adding timestamps", function() {
      var tableSql = new SchemaBuilder().table('users', function(table) {
        table.timestamps();
      }).toSql();
      equal(1, tableSql.length);
      expect(tableSql[0].sql).to.equal('alter table "users" add column "created_at" timestamp, add column "updated_at" timestamp');
    });

    it("adding binary", function() {
      var tableSql = new SchemaBuilder().table('users', function(table) {
        table.binary('foo');
      }).toSql();
      equal(1, tableSql.length);
      expect(tableSql[0].sql).to.equal('alter table "users" add column "foo" bytea');
    });

  });

};