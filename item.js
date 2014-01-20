// var knex    = .initialize({client: 'sqlite3'});
var Builder = require('./knex').dialect('sqlite3');

var chain   = Builder
                .from('accounts')
                .column('item1 as item4')
                .column('item2')
                .sum('cols')
                .where('id', '=', 1)
                .where({i: 1, b: Builder.raw(2)})
                .join('test_table_two', function() {
                    this.on('accounts.id', '=', 'test_table_two.account_id')
                        .orOn('item.id', '=', '');
                })
                .groupBy('items')
                .orderBy(['name', 'item', 'value'], 'asc')
                .orderBy('otherVal', 'desc')
                .transacting({})
                .forShare()
                .having('items', '<', 300)
                .limit(2)
                .offset(1);

                // .orWhere('id', '=', Builder.select('item as value').from('items').where('id', 2))
                // .orWhere(function() {
                //     this.where('one', '=', 2);
                // });

console.log(
  chain.select('tim').toString()
);