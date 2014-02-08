module.exports = function(postgresclient, mysqlclient, sqlite3client) {

  var Raw     = require('../../../lib/raw');

  var PGQuery    = require('../../../lib/query')(postgresclient);
  var MySQLQuery = require('../../../lib/query')(mysqlclient);
  var sql     = new PGQuery();
  var mysql   = new MySQLQuery();

  describe("QueryBuilder", function() {

    it("basic select", function () {
      var chain = sql.select('*').from('users').toSql();
      expect(chain.sql).to.equal('select * from "users"');
    });

    it("adding selects", function () {
      var chain = sql.select('foo').select('bar').select(['baz', 'boom']).from('users').toSql();
      expect(chain.sql).to.equal('select "foo", "bar", "baz", "boom" from "users"');
    });

    it("basic select distinct", function () {
      var chain = sql.distinct().select('foo', 'bar').from('users').toSql();
      expect(chain.sql).to.equal('select distinct "foo", "bar" from "users"');
    });

    it("basic alias", function () {
      var chain = sql.select('foo as bar').from('users').toSql();
      expect(chain.sql).to.equal('select "foo" as "bar" from "users"');
    });

    it("basic table wrapping", function () {
      var chain = sql.select('*').from('public.users').toSql();
      expect(chain.sql).to.equal('select * from "public"."users"');
    });

    it("basic wheres", function () {
      var chain = sql.select('*').from('users').where('id', '=', 1).toSql();
      expect(chain.sql).to.equal('select * from "users" where "id" = ?');
      expect(chain.bindings).to.eql([1]);
    });

    it("where betweens", function () {
      var chain = sql.select('*').from('users').whereBetween('id', [1, 2]).toSql();
      expect(chain.sql).to.equal('select * from "users" where "id" between ? and ?');
      expect(chain.bindings).to.eql([1, 2]);

      chain = sql.select('*').from('users').whereNotBetween('id', [1, 2]).toSql();
      expect(chain.sql).to.equal('select * from "users" where "id" not between ? and ?');
      expect(chain.bindings).to.eql([1, 2]);
    });

    it("basic or wheres", function () {
      var chain = sql.select('*').from('users').where('id', '=', 1).orWhere('email', '=', 'foo').toSql();
      expect(chain.sql).to.equal('select * from "users" where "id" = ? or "email" = ?');
      expect(chain.bindings).to.eql([1, 'foo']);
    });

    it("raw wheres", function () {
      var chain = sql.select('*').from('users').whereRaw('id = ? or email = ?', [1, 'foo']).toSql();
      expect(chain.sql).to.equal('select * from "users" where id = ? or email = ?');
      expect(chain.bindings).to.eql([1, 'foo']);
    });

    it("raw or wheres", function () {
      var chain = sql.select('*').from('users').where('id', '=', 1).orWhereRaw('email = ?', ['foo']).toSql();
      expect(chain.sql).to.equal('select * from "users" where "id" = ? or email = ?');
      expect(chain.bindings).to.eql([1, 'foo']);
    });

    it("basic where ins", function () {
      var chain = sql.select('*').from('users').whereIn('id', [1, 2, 3]).toSql();
      expect(chain.sql).to.equal('select * from "users" where "id" in (?, ?, ?)');
      expect(chain.bindings).to.eql([1, 2, 3]);

      chain = sql.select('*').from('users').where('id', '=', 1).orWhereIn('id', [1, 2, 3]).toSql();
      expect(chain.sql).to.equal('select * from "users" where "id" = ? or "id" in (?, ?, ?)');
      expect(chain.bindings).to.eql([1, 1, 2, 3]);
    });

    it("basic where not ins", function () {
      var chain = sql.select('*').from('users').whereNotIn('id', [1, 2, 3]).toSql();
      expect(chain.sql).to.equal('select * from "users" where "id" not in (?, ?, ?)');
      expect(chain.bindings).to.eql([1, 2, 3]);

      chain = sql.select('*').from('users').where('id', '=', 1).orWhereNotIn('id', [1, 2, 3]).toSql();
      expect(chain.sql).to.equal('select * from "users" where "id" = ? or "id" not in (?, ?, ?)');
      expect(chain.bindings).to.eql([1, 1, 2, 3]);
    });

    it("unions", function () {
      var chain = sql.select('*').from('users').where('id', '=', 1);
      chain = chain.union(sql.select('*').from('users').where('id', '=', 2)).toSql();
      expect(chain.sql).to.equal('select * from "users" where "id" = ? union select * from "users" where "id" = ?');
      expect(chain.bindings).to.eql([1, 2]);

      chain = mysql.wrap(mysql.select('*').from('users').where('id', '=', 1));
      chain = chain.union(mysql.wrap(mysql.select('*').from('users').where('id', '=', 2))).toSql();
      expect(chain.sql).to.equal('(select * from `users` where `id` = ?) union (select * from `users` where `id` = ?)');
      expect(chain.bindings).to.eql([1, 2]);
    });

    it("union alls", function () {
      var chain = sql.select('*').from('users').where('id', '=', 1);
      chain = chain.unionAll(sql.select('*').from('users').where('id', '=', 2)).toSql();
      expect(chain.sql).to.equal('select * from "users" where "id" = ? union all select * from "users" where "id" = ?');
      expect(chain.bindings).to.eql([1, 2]);
    });

    it("multiple unions", function () {
      var chain = sql.select('*').from('users').where('id', '=', 1);
      chain = chain.union(sql.select('*').from('users').where('id', '=', 2));
      chain = chain.union(sql.select('*').from('users').where('id', '=', 3)).toSql();
      expect(chain.sql).to.equal('select * from "users" where "id" = ? union select * from "users" where "id" = ? union select * from "users" where "id" = ?');
      expect(chain.bindings).to.eql([1, 2, 3]);
    });

    it("multiple union alls", function () {
      var chain = sql.select('*').from('users').where('id', '=', 1);
      chain = chain.unionAll(sql.select('*').from('users').where('id', '=', 2));
      chain = chain.unionAll(sql.select('*').from('users').where('id', '=', 3)).toSql();
      expect(chain.sql).to.equal('select * from "users" where "id" = ? union all select * from "users" where "id" = ? union all select * from "users" where "id" = ?');
      expect(chain.bindings).to.eql([1, 2, 3]);
    });

    it("sub select where ins", function () {
      var chain = sql.select('*').from('users').whereIn('id', function(qb) {
        qb.select('id').from('users').where('age', '>', 25).limit(3);
      }).toSql();
      expect(chain.sql).to.equal('select * from "users" where "id" in (select "id" from "users" where "age" > ? limit ?)');
      expect(chain.bindings).to.eql([25, 3]);

      chain = sql.select('*').from('users').whereNotIn('id', function(qb) {
        qb.select('id').from('users').where('age', '>', 25).limit(3);
      }).toSql();
      expect(chain.sql).to.equal('select * from "users" where "id" not in (select "id" from "users" where "age" > ? limit ?)');
      expect(chain.bindings).to.eql([25, 3]);
    });

    it("basic where nulls", function () {
      var chain = sql.select('*').from('users').whereNull('id').toSql();
      expect(chain.sql).to.equal('select * from "users" where "id" is null');
      expect(chain.bindings).to.eql([]);

      chain = sql.select('*').from('users').where('id', '=', 1).orWhereNull('id').toSql();
      expect(chain.sql).to.equal('select * from "users" where "id" = ? or "id" is null');
      expect(chain.bindings).to.eql([1]);
    });

    it("basic where not nulls", function () {
      var chain = sql.select('*').from('users').whereNotNull('id').toSql();
      expect(chain.sql).to.equal('select * from "users" where "id" is not null');
      expect(chain.bindings).to.eql([]);

      chain = sql.select('*').from('users').where('id', '>', 1).orWhereNotNull('id').toSql();
      expect(chain.sql).to.equal('select * from "users" where "id" > ? or "id" is not null');
      expect(chain.bindings).to.eql([1]);
    });

    it("group bys", function () {
      var chain = sql.select('*').from('users').groupBy('id', 'email').toSql();
      expect(chain.sql).to.equal('select * from "users" group by "id", "email"');
    });

    // it("order bys", function () {
    //   var chain = sql.select('*').from('users').orderBy('email').orderBy('age', 'desc');
    //   var builder = chain.toSql();
    //   expect(chain.sql).to.equal('select * from "users" order by "email" asc, "age" desc');

    //   chain = sql.select('*').from('users').orderBy('email').orderByRaw('"age" ? desc', {foo: 'bar'});
    //   builder = chain.toSql();
    //   expect(chain.sql).to.equal('select * from "users" order by "email" asc, "age" ? desc');
    //   expect(chain.bindings).to.eql({foo: 'bar'});
    // });

    it("havings", function () {
      var chain = sql.select('*').from('users').having('email', '>', 1).toSql();
      expect(chain.sql).to.equal('select * from "users" having "email" > ?');

      chain = sql.select('*').from('users').groupBy('email').having('email', '>', 1).toSql();
      expect(chain.sql).to.equal('select * from "users" group by "email" having "email" > ?');

      chain = sql.select('email as foo_email').from('users').having('foo_email', '>', 1).toSql();
      expect(chain.sql).to.equal('select "email" as "foo_email" from "users" having "foo_email" > ?');
    });

    it("raw havings", function () {
      var chain = sql.select('*').from('users').havingRaw('user_foo < user_bar').toSql();
      expect(chain.sql).to.equal('select * from "users" having user_foo < user_bar');

      chain = sql.select('*').from('users').having('baz', '=', 1).orHavingRaw('user_foo < user_bar').toSql();
      expect(chain.sql).to.equal('select * from "users" having "baz" = ? or user_foo < user_bar');
    });

    it("limits and offsets", function () {
      var chain = sql.select('*').from('users').offset(5).limit(10).toSql();
      expect(chain.sql).to.equal('select * from "users" limit ? offset ?');
      expect(chain.bindings).to.eql([10, 5]);

      // chain = sql.select('*').from('users').offset(-5).take(10);
      // builder = chain.toSql();
      // expect(chain.sql).to.equal('select * from "users" limit 10 offset 0');

      // chain = sql.select('*').from('users').forPage(2, 15);
      // builder = chain.toSql();
      // expect(chain.sql).to.equal('select * from "users" limit 15 offset 15');

      // chain = sql.select('*').from('users').forPage(-2, 15);
      // builder = chain.toSql();
      // expect(chain.sql).to.equal('select * from "users" limit 15 offset 0');
    });

    it("where shortcut", function () {
      var chain = sql.select('*').from('users').where('id', 1).orWhere('name', 'foo').toSql();
      expect(chain.sql).to.equal('select * from "users" where "id" = ? or "name" = ?');
      expect(chain.bindings).to.eql([1, 'foo']);
    });

    it("nested wheres", function () {
      var chain = sql.select('*').from('users').where('email', '=', 'foo').orWhere(function($q)
      {
        $q.where('name', '=', 'bar').where('age', '=', 25);
      }).toSql();
      expect(chain.sql).to.equal('select * from "users" where "email" = ? or ("name" = ? and "age" = ?)');
      expect(chain.bindings).to.eql(['foo', 'bar', 25]);
    });

    it("full sub selects", function () {
      var chain = sql.select('*').from('users').where('email', '=', 'foo').orWhere('id', '=', function(qb) {
        qb.select(new Raw('max(id)')).from('users').where('email', '=', 'bar');
      }).toSql();
      expect(chain.sql).to.equal('select * from "users" where "email" = ? or "id" = (select max(id) from "users" where "email" = ?)');
      expect(chain.bindings).to.eql(['foo', 'bar']);
    });

    it("where exists", function () {
      var chain = sql.select('*').from('orders').whereExists(function(qb) {
        qb.select('*').from('products').where('products.id', '=', new Raw('"orders"."id"'));
      }).toSql();
      expect(chain.sql).to.equal('select * from "orders" where exists (select * from "products" where "products"."id" = "orders"."id")');

      chain = sql.select('*').from('orders').whereNotExists(function(qb) {
        qb.select('*').from('products').where('products.id', '=', new Raw('"orders"."id"'));
      }).toSql();
      expect(chain.sql).to.equal('select * from "orders" where not exists (select * from "products" where "products"."id" = "orders"."id")');

      chain = sql.select('*').from('orders').where('id', '=', 1).orWhereExists(function(qb) {
        qb.select('*').from('products').where('products.id', '=', new Raw('"orders"."id"'));
      }).toSql();
      expect(chain.sql).to.equal('select * from "orders" where "id" = ? or exists (select * from "products" where "products"."id" = "orders"."id")');

      chain = sql.select('*').from('orders').where('id', '=', 1).orWhereNotExists(function(qb) {
        qb.select('*').from('products').where('products.id', '=', new Raw('"orders"."id"'));
      }).toSql();
      expect(chain.sql).to.equal('select * from "orders" where "id" = ? or not exists (select * from "products" where "products"."id" = "orders"."id")');
    });

    it("basic joins", function () {
      var chain = sql.select('*').from('users').join('contacts', 'users.id', '=', 'contacts.id').leftJoin('photos', 'users.id', '=', 'photos.id').toSql();
      expect(chain.sql).to.equal('select * from "users" inner join "contacts" on "users"."id" = "contacts"."id" left join "photos" on "users"."id" = "photos"."id"');

      // var chain = sql.select('*').from('users').leftJoinWhere('photos', 'users.id', '=', 'bar').joinWhere('photos', 'users.id', '=', 'foo');
      // var builder = chain.toSql();
      // expect(chain.sql).to.equal('select * from "users" left join "photos" on "users"."id" = ? inner join "photos" on "users"."id" = ?');
      // expect(chain.bindings).to.eql(['bar', 'foo']);
    });

    it("complex join", function () {
      var chain = sql.select('*').from('users').join('contacts', function(qb) {
        qb.on('users.id', '=', 'contacts.id').orOn('users.name', '=', 'contacts.name');
      }).toSql();
      expect(chain.sql).to.equal('select * from "users" inner join "contacts" on "users"."id" = "contacts"."id" or "users"."name" = "contacts"."name"');

      // var chain = sql.select('*').from('users').join('contacts', function($j)
      // {
      //   $j.where('users.id', '=', 'foo').orWhere('users.name', '=', 'bar');
      // });
      // var builder = chain.toSql();
      // expect(chain.sql).to.equal('select * from "users" inner join "contacts" on "users"."id" = ? or "users"."name" = ?');
      // expect(chain.bindings).to.eql(['foo', 'bar']);
    });

    it("raw expressions in select", function () {
      var chain = sql.select(new Raw('substr(foo, 6)')).from('users').toSql();
      expect(chain.sql).to.equal('select substr(foo, 6) from "users"');
    });

    // it("list methods gets array of column values", function () {
    //   var chain = sql.getConnection().shouldReceive('select').once().andReturn(array({foo: 'bar'}, {'foo': 'baz'}));
    //   $builder.getProcessor().shouldReceive('processSelect').once().with($builder, array({foo: 'bar'}, {foo: 'baz'})).andReturnUsing(function($query, $results)
    //   {
    //     return $results;
    //   });
    //   $results = $builder.from('users').where('id', '=', 1).lists('foo');
    //   equal(array('bar', 'baz'), $results);

    // //   var chain = sql.getConnection().shouldReceive('select').once().andReturn(array(array('id' => 1, 'foo' => 'bar'), array('id' => 10, 'foo' => 'baz')));
    // //   $builder.getProcessor().shouldReceive('processSelect').once().with($builder, array(array('id' => 1, 'foo' => 'bar'), array('id' => 10, 'foo' => 'baz'))).andReturnUsing(function($query, $results)
    //   {
    //     return $results;
    //   });
    //   $results = $builder.from('users').where('id', '=', 1).lists('foo', 'id');
    // //   equal(array(1 => 'bar', 10 => 'baz'), $results);
    // });

    // it("pluck method returns single column", function () {
    //   var chain = sql.getConnection().shouldReceive('select').once().with('select "foo" from "users" where "id" = ? limit 1', [1]).andReturn(array({foo: 'bar'}));
    //   $builder.getProcessor().shouldReceive('processSelect').once().with($builder, array({foo: 'bar'})).andReturn(array({foo: 'bar'}));
    //   $results = $builder.from('users').where('id', '=', 1).pluck('foo');
    //   equal('bar', $results);
    // });

    it("aggregate functions", function () {
      var chain = sql.from('users').count().toSql();
      expect(chain.sql).to.equal('select count(*) from "users"');

      chain = sql.from('users').count('* as all').toSql();
      expect(chain.sql).to.equal('select count(*) as "all" from "users"');

      chain = sql.from('users').max('id').toSql();
      expect(chain.sql).to.equal('select max("id") from "users"');

      chain = sql.from('users').min('id').toSql();
      expect(chain.sql).to.equal('select min("id") from "users"');

      chain = sql.from('users').sum('id').toSql();
      expect(chain.sql).to.equal('select sum("id") from "users"');
    });

    it("insert method", function () {
      var value = sql.into('users').insert({'email': 'foo'}).toSql();
      expect(value.sql).to.equal('insert into "users" ("email") values (?)');
      expect(value.bindings).to.eql(['foo']);
    });

    // it("SQLite3 multiple inserts", function () {
    //   $builder = $this.getSQLiteBuilder();
    //   $builder.getConnection().shouldReceive('insert').once().with('insert into "users" ("email", "name") select ? as "email", ? as "name" union select ? as "email", ? as "name"', array('foo', 'taylor', 'bar', 'dayle')).andReturn(true);
    //   // $result = $builder.from('users').insert(array(array('email' => 'foo', 'name' => 'taylor'), array('email' => 'bar', 'name' => 'dayle')));
    //   $this.assertTrue($result);
    // });

    // it("insert get id method", function () {
    //   var chain = sql.getProcessor().shouldReceive('processInsertGetId').once().with($builder, 'insert into "users" ("email") values (?)', array('foo'), 'id').andReturn(1);
    //   // $result = $builder.from('users').insertGetId(array('email' => 'foo'), 'id');
    //   equal(1, $result);
    // });

    // it("insert get id method removes expressions", function () {
    //   var chain = sql.getProcessor().shouldReceive('processInsertGetId').once().with($builder, 'insert into "users" ("email", "bar") values (?, bar)', array('foo'), 'id').andReturn(1);
    //   // // $result = $builder.from('users').insertGetId(array('email' => 'foo', 'bar' => new Illuminate\Database\Query\Expression('bar')), 'id');
    //   equal(1, $result);
    // });

    it("insert method respects raw bindings", function () {
      var result = sql.insert({'email': new Raw('CURRENT TIMESTAMP')}).into('users').toSql();
      expect(result.sql).to.equal('insert into "users" ("email") values (CURRENT TIMESTAMP)');
    });

    it("update method", function () {
      var chain = sql.update({'email': 'foo', 'name': 'bar'}).table('users').where('id', '=', 1).toSql();
      expect(chain.sql).to.equal('update "users" set "email" = ?, "name" = ? where "id" = ?');
      expect(chain.bindings).to.eql(['foo', 'bar', 1]);

      // $builder = $this.getMySqlBuilder();
      // $builder.getConnection().shouldReceive('update').once().with('update `users` set `email` = ?, `name` = ? where `id` = ? order by `foo` desc limit 5', array('foo', 'bar', 1)).andReturn(1);
      // var // chain = $builder.from('users').where('id', '=', 1).orderBy('foo', 'desc').limit(5).update(array('email' => 'foo', 'name' => 'bar'));
      // var equal(1, chain);
    });

    it("update method with joins", function () {
      var chain = sql.from('users').join('orders', 'users.id', 'orders.user_id').where('users.id', '=', 1).update({'email': 'foo', 'name': 'bar'}).toSql();
      expect(chain.sql).to.equal('update "users" inner join "orders" on "users"."id" = "orders"."user_id" set "email" = ?, "name" = ? where "users"."id" = ?');
      expect(chain.bindings).to.eql(['foo', 'bar', 1]);
    });

    // it("update method without joins on postgres", function () {
    //   $builder = $this.getPostgresBuilder();
    //   $builder.getConnection().shouldReceive('update').once().with('update "users" set "email" = ?, "name" = ? where "id" = ?', array('foo', 'bar', 1)).andReturn(1);
    //   // $result = $builder.from('users').where('id', '=', 1).update(array('email' => 'foo', 'name' => 'bar'));
    //   equal(1, $result);
    // });

    // it("update method with joins on postgres", function () {
    //   $builder = $this.getPostgresBuilder();
    //   $builder.getConnection().shouldReceive('update').once().with('update "users" set "email" = ?, "name" = ? from "orders" where "users"."id" = ? and "users"."id" = "orders"."user_id"', array('foo', 'bar', 1)).andReturn(1);
    //   // $result = $builder.from('users').join('orders', 'users.id', '=', 'orders.user_id').where('users.id', '=', 1).update(array('email' => 'foo', 'name' => 'bar'));
    //   equal(1, $result);
    // });

    it("update method respects raw", function() {
      var chain = sql.from('users').where('id', '=', 1).update({email: new Raw('foo'), name: 'bar'}).toSql();
      expect(chain.sql).to.equal('update "users" set "email" = foo, "name" = ? where "id" = ?');
      expect(chain.bindings).to.eql(['bar', 1]);
    });

    it("delete method", function () {
      var chain = sql.from('users').where('email', '=', 'foo').delete().toSql();
      expect(chain.sql).to.equal('delete from "users" where "email" = ?');
      expect(chain.bindings).to.eql(['foo']);
    });

    // it("truncate method", function () {
    //   var chain = sql.getConnection().shouldReceive('statement').once().with('truncate "users"', []);
    //   $builder.from('users').truncate();

    //   // $sqlite = new Illuminate\Database\Query\Grammars\SQLiteGrammar;
    //   var chain = sql.from('users');
    //   equal(array(
    //     // 'delete from sqlite_sequence where name = ?' => array('users'),
    //     // 'delete from "users"' => [],
    //   ), $sqlite.compileTruncate($builder));
    // });

    // it("postgres insert get id", function () {
    //   $builder = $this.getPostgresBuilder();
    //   $builder.getProcessor().shouldReceive('processInsertGetId').once().with($builder, 'insert into "users" ("email") values (?) returning "id"', array('foo'), 'id').andReturn(1);
    //   // $result = $builder.from('users').insertGetId(array('email' => 'foo'), 'id');
    //   equal(1, $result);
    // });

    // it("MySQL wrapping", function () {
    //   $builder = $this.getMySqlBuilder();
    //   $builder.select('*').from('users').toSql();
    //   expect(chain.sql).to.equal('select * from `users`');
    // });

    // it("SQLite order by", function () {
    //   $builder = $this.getSQLiteBuilder();
    //   $builder.select('*').from('users').orderBy('email', 'desc').toSql();
    //   expect(chain.sql).to.equal('select * from "users" order by "email" desc');
    // });

    // it("sql server limits and offsets", function () {
    //   $builder = $this.getSqlServerBuilder();
    //   $builder.select('*').from('users').take(10).toSql();
    //   expect(chain.sql).to.equal('select top 10 * from [users]');

    //   $builder = $this.getSqlServerBuilder();
    //   $builder.select('*').from('users').skip(10).toSql();
    //   expect(chain.sql).to.equal('select * from (select *, row_number() over (order by (select 0)) as row_num from [users]) as temp_table where row_num >= 11');

    //   $builder = $this.getSqlServerBuilder();
    //   $builder.select('*').from('users').skip(10).take(10).toSql();
    //   expect(chain.sql).to.equal('select * from (select *, row_number() over (order by (select 0)) as row_num from [users]) as temp_table where row_num between 11 and 20');

    //   $builder = $this.getSqlServerBuilder();
    //   $builder.select('*').from('users').skip(10).take(10).orderBy('email', 'desc').toSql();
    //   expect(chain.sql).to.equal('select * from (select *, row_number() over (order by [email] desc) as row_num from [users]) as temp_table where row_num between 11 and 20');
    // });

    it("providing null or false as second parameter builds correctly", function () {
      var chain = sql.select('*').from('users').where('foo', null).toSql();
      expect(chain.sql).to.equal('select * from "users" where "foo" is null');
    });

    it("MySQL locks", function (){
      var chain = mysql.transacting({}).select('*').from('foo').where('bar', '=', 'baz').forUpdate().toSql();
      expect(chain.sql).to.equal('select * from `foo` where `bar` = ? for update');
      expect(chain.bindings).to.eql(['baz']);

      chain = mysql.transacting({}).select('*').from('foo').where('bar', '=', 'baz').forShare().toSql();
      expect(chain.sql).to.equal('select * from `foo` where `bar` = ? lock in share mode');
      expect(chain.bindings).to.eql(['baz']);
    });

    it("should warn when trying to use forUpdate outside of a transaction", function() {
      var chain = mysql.select('*').from('foo').where('bar', '=', 'baz').forUpdate().toSql();
      expect(chain.sql).to.equal('select * from `foo` where `bar` = ?');
      expect(chain.bindings).to.eql(['baz']);
    });

    // it("Postgres lock", function () {
    //   $builder = $this.getPostgresBuilder();
    //   $builder.select('*').from('foo').where('bar', '=', 'baz').lock().toSql();
    //   expect(chain.sql).to.equal('select * from "foo" where "bar" = ? for update');
    //   expect(chain.bindings).to.eql(array('baz'));

    //   $builder = $this.getPostgresBuilder();
    //   $builder.select('*').from('foo').where('bar', '=', 'baz').lock(false).toSql();
    //   expect(chain.sql).to.equal('select * from "foo" where "bar" = ? for share');
    //   expect(chain.bindings).to.eql(array('baz'));
    // });

    // it("SQLServer lock", function () {
    //   $builder = $this.getSqlServerBuilder();
    //   $builder.select('*').from('foo').where('bar', '=', 'baz').lock().toSql();
    //   expect(chain.sql).to.equal('select * from [foo] with(rowlock,updlock,holdlock) where [bar] = ?');
    //   expect(chain.bindings).to.eql(array('baz'));

    //   $builder = $this.getSqlServerBuilder();
    //   $builder.select('*').from('foo').where('bar', '=', 'baz').lock(false).toSql();
    //   expect(chain.sql).to.equal('select * from [foo] with(rowlock,holdlock) where [bar] = ?');
    //   expect(chain.bindings).to.eql(array('baz'));
    // });

    it('allows insert values of sub-select, #121', function() {
      var chain = sql.table('entries').insert({
        secret: 123,
        sequence: sql.wrap(sql.count('*').from('entries').where('secret', 123))
      }).toSql();
      expect(chain.sql).to.equal('insert into "entries" ("secret", "sequence") values (?, (select count(*) from "entries" where "secret" = ?))');
      expect(chain.bindings).to.eql([123, 123]);
    });

    it('allows left outer join with raw values', function() {
      var chain = sql.select('*').from('student').leftOuterJoin('student_languages', function() {
        this.on('student.id', 'student_languages.student_id').andOn('student_languages.code', sql.raw('?', 'en_US'));
      }).toSql();
      expect(chain.sql).to.equal('select * from "student" left outer join "student_languages" on "student"."id" = "student_languages"."student_id" and "student_languages"."code" = ?');
    });

  });

};