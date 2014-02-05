describe("DatabaseMySqlSchemaGrammarTest", function() {

  it('test basic create table', function() {
    var tableSql = new TableInterface('users', function() {
      this.create();
      this.increments('id');
      this.string('email');

      // $conn = this.getConnection();
      // $conn.shouldReceive('getConfig').once().with('charset').andReturn('utf8');
      // $conn.shouldReceive('getConfig').once().with('collation').andReturn('utf8_unicode_ci');

    }).toSql($conn, this.getGrammar());

    equal(1, count($statements));
    equal('create table `users` (`id` int unsigned not null auto_increment primary key, `email` varchar(255)) default character set utf8 collate utf8_unicode_ci', $statements[0]);
  });

  it('placeholder', function() {
    var tableSql = new TableInterface('users', function() {
      this.increments('id');
      this.string('email');

      $conn = this.getConnection();
      $conn.shouldReceive('getConfig').andReturn(null);

    }).toSql($conn, this.getGrammar());

    equal(1, count($statements));
    equal('alter table `users` add `id` int unsigned not null auto_increment primary key, add `email` varchar(255)', $statements[0]);
  });

  it('test basic create table with prefix', function() {
    var tableSql = new TableInterface('users', function() {
      this.create();
      this.increments('id');
      this.string('email');
      $conn = this.getConnection();
      $conn.shouldReceive('getConfig').andReturn(null);

    }).toSql($conn, $grammar);

    equal(1, count($statements));
    equal('create table `prefix_users` (`id` int unsigned not null auto_increment primary key, `email` varchar(255))', $statements[0]);
  });

  it('test drop table', function() {
    var tableSql = new TableInterface('users', function() {
      this.drop();
    }).toSql(this.getConnection(), this.getGrammar());

    equal(1, count($statements));
    equal('drop table `users`', $statements[0]);
  });

  it('test drop table if exists', function() {
    var tableSql = new TableInterface('users', function() {
      this.dropIfExists();
    }).toSql(this.getConnection(), this.getGrammar());

    equal(1, count($statements));
    equal('drop table if exists `users`', $statements[0]);
  });

  it('test drop column', function() {
    var tableSql = new TableInterface('users', function() {
      this.dropColumn('foo');
    }).toSql(this.getConnection(), this.getGrammar());

    equal(1, count($statements));
    equal('alter table `users` drop `foo`', $statements[0]);
  });

  it('placeholder', function() {
    var tableSql = new TableInterface('users', function() {
      this.dropColumn(array('foo', 'bar'));
    }).toSql(this.getConnection(), this.getGrammar());

    equal(1, count($statements));
    equal('alter table `users` drop `foo`, drop `bar`', $statements[0]);
  });

  it('placeholder', function() {
    var tableSql = new TableInterface('users', function() {
      this.dropColumn('foo', 'bar');
    }).toSql(this.getConnection(), this.getGrammar());

    equal(1, count($statements));
    equal('alter table `users` drop `foo`, drop `bar`', $statements[0]);
  });

  it('test drop primary', function() {
    var tableSql = new TableInterface('users', function() {
      this.dropPrimary();
    }).toSql(this.getConnection(), this.getGrammar());

    equal(1, count($statements));
    equal('alter table `users` drop primary key', $statements[0]);
  });

  it('test drop unique', function() {
    var tableSql = new TableInterface('users', function() {
      this.dropUnique('foo');
    }).toSql(this.getConnection(), this.getGrammar());

    equal(1, count($statements));
    equal('alter table `users` drop index foo', $statements[0]);
  });

  it('test drop index', function() {
    var tableSql = new TableInterface('users', function() {
      this.dropIndex('foo');
    }).toSql(this.getConnection(), this.getGrammar());

    equal(1, count($statements));
    equal('alter table `users` drop index foo', $statements[0]);
  });

  it('test drop foreign', function() {
    var tableSql = new TableInterface('users', function() {
      this.dropForeign('foo');
    }).toSql(this.getConnection(), this.getGrammar());

    equal(1, count($statements));
    equal('alter table `users` drop foreign key foo', $statements[0]);
  });

  it('test drop timestamps', function() {
    var tableSql = new TableInterface('users', function() {
      this.dropTimestamps();
    }).toSql(this.getConnection(), this.getGrammar());

    equal(1, count($statements));
    equal('alter table `users` drop `created_at`, drop `updated_at`', $statements[0]);
  });

  it('test rename table', function() {
    var tableSql = new TableInterface('users', function() {
      this.rename('foo');
    }).toSql(this.getConnection(), this.getGrammar());

    equal(1, count($statements));
    equal('rename table `users` to `foo`', $statements[0]);
  });

  it('test adding primary key', function() {
    var tableSql = new TableInterface('users', function() {
      this.primary('foo', 'bar');
    }).toSql(this.getConnection(), this.getGrammar());

    equal(1, count($statements));
    equal('alter table `users` add primary key bar(`foo`)', $statements[0]);
  });

  it('test adding unique key', function() {
    var tableSql = new TableInterface('users', function() {
      this.unique('foo', 'bar');
    }).toSql(this.getConnection(), this.getGrammar());

    equal(1, count($statements));
    equal('alter table `users` add unique bar(`foo`)', $statements[0]);
  });

  it('test adding index', function() {
    var tableSql = new TableInterface('users', function() {
      this.index(array('foo', 'bar'), 'baz');
    }).toSql(this.getConnection(), this.getGrammar());

    equal(1, count($statements));
    equal('alter table `users` add index baz(`foo`, `bar`)', $statements[0]);
  });

  it('test adding foreign key', function() {
    var tableSql = new TableInterface('users', function() {
      this.foreign('foo_id').references('id').on('orders');
    }).toSql(this.getConnection(), this.getGrammar());

    equal(1, count($statements));
    equal('alter table `users` add constraint users_foo_id_foreign foreign key (`foo_id`) references `orders` (`id`)', $statements[0]);
  });

  it('test adding incrementing i d', function() {
    var tableSql = new TableInterface('users', function() {
      this.increments('id');
    }).toSql(this.getConnection(), this.getGrammar());

    equal(1, count($statements));
    equal('alter table `users` add `id` int unsigned not null auto_increment primary key', $statements[0]);
  });

  it('test adding big incrementing i d', function() {
    var tableSql = new TableInterface('users', function() {
      this.bigIncrements('id');
    }).toSql(this.getConnection(), this.getGrammar());

    equal(1, count($statements));
    equal('alter table `users` add `id` bigint unsigned not null auto_increment primary key', $statements[0]);
  });

  it('test adding column after another column', function() {
    var tableSql = new TableInterface('users', function() {
      this.string('name').after('foo');
    }).toSql(this.getConnection(), this.getGrammar());

    equal(1, count($statements));
    equal('alter table `users` add `name` varchar(255) after `foo`', $statements[0]);
  });

  it('test adding string', function() {
    var tableSql = new TableInterface('users', function() {
      this.string('foo');
    }).toSql(this.getConnection(), this.getGrammar());

    equal(1, count($statements));
    equal('alter table `users` add `foo` varchar(255)', $statements[0]);
  });

  it('placeholder', function() {
    var tableSql = new TableInterface('users', function() {
      this.string('foo', 100);
    }).toSql(this.getConnection(), this.getGrammar());

    equal(1, count($statements));
    equal('alter table `users` add `foo` varchar(100)', $statements[0]);
  });

  it('placeholder', function() {
    var tableSql = new TableInterface('users', function() {
      this.string('foo', 100).nullable().
      default ('bar');
    }).toSql(this.getConnection(), this.getGrammar());

    equal(1, count($statements));
    equal('alter table `users` add `foo` varchar(100) null default \'bar\'', $statements[0]);
  });

  it('placeholder', function() {
    var tableSql = new TableInterface('users', function() {
      this.string('foo', 100).nullable().defaultTo(knex.raw('CURRENT TIMESTAMP'));
    }).toSql(this.getConnection(), this.getGrammar());

    equal(1, count($statements));
    equal('alter table `users` add `foo` varchar(100) null default CURRENT TIMESTAMP', $statements[0]);
  });

  it('test adding text', function() {
    var tableSql = new TableInterface('users', function() {
      this.text('foo');
    }).toSql(this.getConnection(), this.getGrammar());

    equal(1, count($statements));
    equal('alter table `users` add `foo` text not null', $statements[0]);
  });

  it('test adding big integer', function() {
    var tableSql = new TableInterface('users', function() {
      this.bigInteger('foo');
    }).toSql(this.getConnection(), this.getGrammar());

    equal(1, count($statements));
    equal('alter table `users` add `foo` bigint not null', $statements[0]);
  });

  it('placeholder', function() {
    var tableSql = new TableInterface('users', function() {
      this.bigInteger('foo', true);
    }).toSql(this.getConnection(), this.getGrammar());

    equal(1, count($statements));
    equal('alter table `users` add `foo` bigint not null auto_increment primary key', $statements[0]);
  });

  it('test adding integer', function() {
    var tableSql = new TableInterface('users', function() {
      this.integer('foo');
    }).toSql(this.getConnection(), this.getGrammar());

    equal(1, count($statements));
    equal('alter table `users` add `foo` int not null', $statements[0]);
  });

  it('placeholder', function() {
    var tableSql = new TableInterface('users', function() {
      this.integer('foo', true);
    }).toSql(this.getConnection(), this.getGrammar());

    equal(1, count($statements));
    equal('alter table `users` add `foo` int not null auto_increment primary key', $statements[0]);
  });

  it('test adding medium integer', function() {
    var tableSql = new TableInterface('users', function() {
      this.mediumInteger('foo');
    }).toSql(this.getConnection(), this.getGrammar());

    equal(1, count($statements));
    equal('alter table `users` add `foo` mediumint not null', $statements[0]);
  });

  it('test adding small integer', function() {
    var tableSql = new TableInterface('users', function() {
      this.smallInteger('foo');
    }).toSql(this.getConnection(), this.getGrammar());

    equal(1, count($statements));
    equal('alter table `users` add `foo` smallint not null', $statements[0]);
  });

  it('test adding tiny integer', function() {
    var tableSql = new TableInterface('users', function() {
      this.tinyInteger('foo');
    }).toSql(this.getConnection(), this.getGrammar());

    equal(1, count($statements));
    equal('alter table `users` add `foo` tinyint not null', $statements[0]);
  });

  it('test adding float', function() {
    var tableSql = new TableInterface('users', function() {
      this.float('foo', 5, 2);
    }).toSql(this.getConnection(), this.getGrammar());

    equal(1, count($statements));
    equal('alter table `users` add `foo` float(5, 2)', $statements[0]);
  });

  it('test adding double', function() {
    var tableSql = new TableInterface('users', function() {
      this.double('foo');
    }).toSql(this.getConnection(), this.getGrammar());

    equal(1, count($statements));
    equal('alter table `users` add `foo` double not null', $statements[0]);
  });

  it('test adding double specifying precision', function() {
    var tableSql = new TableInterface('users', function() {
      this.double('foo', 15, 8);
    }).toSql(this.getConnection(), this.getGrammar());

    equal(1, count($statements));
    equal('alter table `users` add `foo` double(15, 8)', $statements[0]);
  });

  it('test adding decimal', function() {
    var tableSql = new TableInterface('users', function() {
      this.decimal('foo', 5, 2);
    }).toSql(this.getConnection(), this.getGrammar());

    equal(1, count($statements));
    equal('alter table `users` add `foo` decimal(5, 2)', $statements[0]);
  });

  it('test adding boolean', function() {
    var tableSql = new TableInterface('users', function() {
      this.boolean('foo');
    }).toSql(this.getConnection(), this.getGrammar());

    equal(1, count($statements));
    equal('alter table `users` add `foo` tinyint(1)', $statements[0]);
  });

  it('test adding enum', function() {
    var tableSql = new TableInterface('users', function() {
      this.enum('foo', array('bar', 'baz'));
    }).toSql(this.getConnection(), this.getGrammar());

    equal(1, count($statements));
    equal('alter table `users` add `foo` enum(\'bar\', \'baz\')', $statements[0]);
  });

  it('test adding date', function() {
    var tableSql = new TableInterface('users', function() {
      this.date('foo');
    }).toSql(this.getConnection(), this.getGrammar());

    equal(1, count($statements));
    equal('alter table `users` add `foo` date not null', $statements[0]);
  });

  it('test adding date time', function() {
    var tableSql = new TableInterface('users', function() {
      this.dateTime('foo');
    }).toSql(this.getConnection(), this.getGrammar());

    equal(1, count($statements));
    equal('alter table `users` add `foo` datetime not null', $statements[0]);
  });

  it('test adding time', function() {
    var tableSql = new TableInterface('users', function() {
      this.time('foo');
    }).toSql(this.getConnection(), this.getGrammar());

    equal(1, count($statements));
    equal('alter table `users` add `foo` time not null', $statements[0]);
  });

  it('test adding time stamp', function() {
    var tableSql = new TableInterface('users', function() {
      this.timestamp('foo');
    }).toSql(this.getConnection(), this.getGrammar());

    equal(1, count($statements));
    equal('alter table `users` add `foo` timestamp default 0 not null', $statements[0]);
  });

  it('test adding time stamps', function() {
    var tableSql = new TableInterface('users', function() {
      this.timestamps();
    }).toSql(this.getConnection(), this.getGrammar());

    equal(1, count($statements));
    equal('alter table `users` add `created_at` timestamp default 0 not null, add `updated_at` timestamp default 0 not null', $statements[0]);
  });

  it('test adding binary', function() {
    var tableSql = new TableInterface('users', function() {
      this.binary('foo');
    }).toSql(this.getConnection(), this.getGrammar());

    equal(1, count($statements));
    equal('alter table `users` add `foo` blob not null', $statements[0]);
  });

});