module.exports = function(client) {

  var knex = require('../../../knex');

  client.initSchema();

  var SchemaBuilder = client.SchemaBuilder;
  var _ = require('lodash');
  var equal = require('assert').equal;
  var deepEqual = require('assert').deepEqual;

  describe("MySQL SchemaBuilder", function() {

    client.initSchema();

    var SchemaBuilder = client.SchemaBuilder;
    var _ = require('lodash');
    var equal = require('assert').equal;
    var deepEqual = require('assert').deepEqual;

    it('test basic create table with charset and collate', function() {
      var tableSql = new SchemaBuilder().createTable('users', function(table) {
        table.increments('id');
        table.string('email');
        table.charset('utf8');
        table.collate('utf8_unicode_ci');
      }).toSql();

      equal(1, tableSql.length);
      expect(tableSql[0].sql).to.equal('create table `users` (`id` int unsigned not null auto_increment primary key, `email` varchar(255)) default character set utf8 collate utf8_unicode_ci');
    });

    it('basic create table without charset or collate', function() {
      var tableSql = new SchemaBuilder().table('users', function() {
        this.increments('id');
        this.string('email');
      }).toSql();

      equal(1, tableSql.length);
      expect(tableSql[0].sql).to.equal('alter table `users` add `id` int unsigned not null auto_increment primary key, add `email` varchar(255)');
    });

    it('test drop table', function() {
      var tableSql = new SchemaBuilder().dropTable('users').toSql();

      equal(1, tableSql.length);
      expect(tableSql[0].sql).to.equal('drop table `users`');
    });

    it('test drop table if exists', function() {
      var tableSql = new SchemaBuilder().dropTableIfExists('users').toSql();

      equal(1, tableSql.length);
      expect(tableSql[0].sql).to.equal('drop table if exists `users`');
    });

    it('test drop column', function() {
      var tableSql = new SchemaBuilder().table('users', function() {
        this.dropColumn('foo');
      }).toSql();

      equal(1, tableSql.length);
      expect(tableSql[0].sql).to.equal('alter table `users` drop `foo`');
    });

    it('drops multiple columns with an array', function() {
      var tableSql = new SchemaBuilder().table('users', function() {
        this.dropColumn(['foo', 'bar']);
      }).toSql();

      equal(1, tableSql.length);
      expect(tableSql[0].sql).to.equal('alter table `users` drop `foo`, drop `bar`');
    });

    it('drops multiple columns as multiple arguments', function() {
      var tableSql = new SchemaBuilder().table('users', function() {
        this.dropColumn('foo', 'bar');
      }).toSql();

      equal(1, tableSql.length);
      expect(tableSql[0].sql).to.equal('alter table `users` drop `foo`, drop `bar`');
    });

    it('test drop primary', function() {
      var tableSql = new SchemaBuilder().table('users', function() {
        this.dropPrimary();
      }).toSql();

      equal(1, tableSql.length);
      expect(tableSql[0].sql).to.equal('alter table `users` drop primary key');
    });

    it('test drop unique', function() {
      var tableSql = new SchemaBuilder().table('users', function() {
        this.dropUnique('foo');
      }).toSql();

      equal(1, tableSql.length);
      expect(tableSql[0].sql).to.equal('alter table `users` drop index foo');
    });

    it('test drop index', function() {
      var tableSql = new SchemaBuilder().table('users', function() {
        this.dropIndex('foo');
      }).toSql();

      equal(1, tableSql.length);
      expect(tableSql[0].sql).to.equal('alter table `users` drop index foo');
    });

    it('test drop foreign', function() {
      var tableSql = new SchemaBuilder().table('users', function() {
        this.dropForeign('foo');
      }).toSql();

      equal(1, tableSql.length);
      expect(tableSql[0].sql).to.equal('alter table `users` drop foreign key foo');
    });

    it('test drop timestamps', function() {
      var tableSql = new SchemaBuilder().table('users', function() {
        this.dropTimestamps();
      }).toSql();

      equal(1, tableSql.length);
      expect(tableSql[0].sql).to.equal('alter table `users` drop `created_at`, drop `updated_at`');
    });

    it('test rename table', function() {
      var tableSql = new SchemaBuilder().renameTable('users', 'foo').toSql();

      equal(1, tableSql.length);
      expect(tableSql[0].sql).to.equal('rename table `users` to `foo`');
    });

    it('test adding primary key', function() {
      var tableSql = new SchemaBuilder().table('users', function() {
        this.primary('foo', 'bar');
      }).toSql();

      equal(1, tableSql.length);
      expect(tableSql[0].sql).to.equal('alter table `users` add primary key bar(`foo`)');
    });

    it('test adding unique key', function() {
      var tableSql = new SchemaBuilder().table('users', function() {
        this.unique('foo', 'bar');
      }).toSql();

      equal(1, tableSql.length);
      expect(tableSql[0].sql).to.equal('alter table `users` add unique bar(`foo`)');
    });

    it('test adding index', function() {
      var tableSql = new SchemaBuilder().table('users', function() {
        this.index(['foo', 'bar'], 'baz');
      }).toSql();

      equal(1, tableSql.length);
      expect(tableSql[0].sql).to.equal('alter table `users` add index baz(`foo`, `bar`)');
    });

    it('test adding foreign key', function() {
      var tableSql = new SchemaBuilder().table('users', function() {
        this.foreign('foo_id').references('id').on('orders');
      }).toSql();

      equal(1, tableSql.length);
      expect(tableSql[0].sql).to.equal('alter table `users` add constraint users_foo_id_foreign foreign key (`foo_id`) references `orders` (`id`)');
    });

    it('test adding incrementing id', function() {
      var tableSql = new SchemaBuilder().table('users', function() {
        this.increments('id');
      }).toSql();

      equal(1, tableSql.length);
      expect(tableSql[0].sql).to.equal('alter table `users` add `id` int unsigned not null auto_increment primary key');
    });

    it('test adding big incrementing id', function() {
      var tableSql = new SchemaBuilder().table('users', function() {
        this.bigIncrements('id');
      }).toSql();

      equal(1, tableSql.length);
      expect(tableSql[0].sql).to.equal('alter table `users` add `id` bigint unsigned not null auto_increment primary key');
    });

    it('test adding column after another column', function() {
      var tableSql = new SchemaBuilder().table('users', function() {
        this.string('name').after('foo');
      }).toSql();

      equal(1, tableSql.length);
      expect(tableSql[0].sql).to.equal('alter table `users` add `name` varchar(255) after `foo`');
    });

    it('test adding string', function() {
      var tableSql = new SchemaBuilder().table('users', function() {
        this.string('foo');
      }).toSql();

      equal(1, tableSql.length);
      expect(tableSql[0].sql).to.equal('alter table `users` add `foo` varchar(255)');
    });

    it('uses the varchar column constraint', function() {
      var tableSql = new SchemaBuilder().table('users', function() {
        this.string('foo', 100);
      }).toSql();

      equal(1, tableSql.length);
      expect(tableSql[0].sql).to.equal('alter table `users` add `foo` varchar(100)');
    });

    it('chains notNull and defaultTo', function() {
      var tableSql = new SchemaBuilder().table('users', function() {
        this.string('foo', 100).notNull().defaultTo('bar');
      }).toSql();

      equal(1, tableSql.length);
      expect(tableSql[0].sql).to.equal('alter table `users` add `foo` varchar(100) null default \'bar\'');
    });

    it('allows for raw values in the default field', function() {
      var tableSql = new SchemaBuilder().table('users', function() {
        this.string('foo', 100).nullable().defaultTo(knex.raw('CURRENT TIMESTAMP'));
      }).toSql();

      equal(1, tableSql.length);
      expect(tableSql[0].sql).to.equal('alter table `users` add `foo` varchar(100) null default CURRENT TIMESTAMP');
    });

    it('test adding text', function() {
      var tableSql = new SchemaBuilder().table('users', function() {
        this.text('foo');
      }).toSql();

      equal(1, tableSql.length);
      expect(tableSql[0].sql).to.equal('alter table `users` add `foo` text');
    });

    it('test adding big integer', function() {
      var tableSql = new SchemaBuilder().table('users', function() {
        this.bigInteger('foo');
      }).toSql();

      equal(1, tableSql.length);
      expect(tableSql[0].sql).to.equal('alter table `users` add `foo` bigint');
    });

    it('test adding integer', function() {
      var tableSql = new SchemaBuilder().table('users', function() {
        this.integer('foo');
      }).toSql();

      equal(1, tableSql.length);
      expect(tableSql[0].sql).to.equal('alter table `users` add `foo` int');
    });

    it('test adding medium integer', function() {
      var tableSql = new SchemaBuilder().table('users', function() {
        this.mediumint('foo');
      }).toSql();

      equal(1, tableSql.length);
      expect(tableSql[0].sql).to.equal('alter table `users` add `foo` mediumint');
    });

    it('test adding small integer', function() {
      var tableSql = new SchemaBuilder().table('users', function() {
        this.smallint('foo');
      }).toSql();

      equal(1, tableSql.length);
      expect(tableSql[0].sql).to.equal('alter table `users` add `foo` smallint');
    });

    it('test adding tiny integer', function() {
      var tableSql = new SchemaBuilder().table('users', function() {
        this.tinyint('foo');
      }).toSql();

      equal(1, tableSql.length);
      expect(tableSql[0].sql).to.equal('alter table `users` add `foo` tinyint');
    });

    it('test adding float', function() {
      var tableSql = new SchemaBuilder().table('users', function() {
        this.float('foo', 5, 2);
      }).toSql();

      equal(1, tableSql.length);
      expect(tableSql[0].sql).to.equal('alter table `users` add `foo` float(5, 2)');
    });

    it('test adding double', function() {
      var tableSql = new SchemaBuilder().table('users', function() {
        this.double('foo');
      }).toSql();

      equal(1, tableSql.length);
      expect(tableSql[0].sql).to.equal('alter table `users` add `foo` double');
    });

    it('test adding double specifying precision', function() {
      var tableSql = new SchemaBuilder().table('users', function() {
        this.double('foo', 15, 8);
      }).toSql();

      equal(1, tableSql.length);
      expect(tableSql[0].sql).to.equal('alter table `users` add `foo` double(15, 8)');
    });

    it('test adding decimal', function() {
      var tableSql = new SchemaBuilder().table('users', function() {
        this.decimal('foo', 5, 2);
      }).toSql();

      equal(1, tableSql.length);
      expect(tableSql[0].sql).to.equal('alter table `users` add `foo` decimal(5, 2)');
    });

    it('test adding boolean', function() {
      var tableSql = new SchemaBuilder().table('users', function() {
        this.boolean('foo');
      }).toSql();

      equal(1, tableSql.length);
      expect(tableSql[0].sql).to.equal('alter table `users` add `foo` boolean');
    });

    it('test adding enum', function() {
      var tableSql = new SchemaBuilder().table('users', function() {
        this.enum('foo', ['bar', 'baz']);
      }).toSql();

      equal(1, tableSql.length);
      expect(tableSql[0].sql).to.equal('alter table `users` add `foo` enum(\'bar\', \'baz\')');
    });

    it('test adding date', function() {
      var tableSql = new SchemaBuilder().table('users', function() {
        this.date('foo');
      }).toSql();

      equal(1, tableSql.length);
      expect(tableSql[0].sql).to.equal('alter table `users` add `foo` date');
    });

    it('test adding date time', function() {
      var tableSql = new SchemaBuilder().table('users', function() {
        this.dateTime('foo');
      }).toSql();

      equal(1, tableSql.length);
      expect(tableSql[0].sql).to.equal('alter table `users` add `foo` datetime');
    });

    it('test adding time', function() {
      var tableSql = new SchemaBuilder().table('users', function() {
        this.time('foo');
      }).toSql();

      equal(1, tableSql.length);
      expect(tableSql[0].sql).to.equal('alter table `users` add `foo` time');
    });

    it('test adding time stamp', function() {
      var tableSql = new SchemaBuilder().table('users', function() {
        this.timestamp('foo');
      }).toSql();

      equal(1, tableSql.length);
      expect(tableSql[0].sql).to.equal('alter table `users` add `foo` timestamp');
    });

    it('test adding time stamps', function() {
      var tableSql = new SchemaBuilder().table('users', function() {
        this.timestamps();
      }).toSql();

      equal(1, tableSql.length);
      expect(tableSql[0].sql).to.equal('alter table `users` add `created_at` datetime, add `updated_at` datetime');
    });

    it('test adding binary', function() {
      var tableSql = new SchemaBuilder().table('users', function() {
        this.binary('foo');
      }).toSql();

      equal(1, tableSql.length);
      expect(tableSql[0].sql).to.equal('alter table `users` add `foo` blob');
    });

  });

};