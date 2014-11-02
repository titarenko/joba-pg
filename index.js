var knex = require('knex');
var debug = require('debug')('joba-pg');

function Persistence (builder) {
	this.builder = builder;
}

Persistence.prototype.createWorklogItem = function createWorklogItem (data) {
	return this.builder.insert(data, 'id').then(function whenInserted (ids) {
		return ids && ids.length && {id: ids[0]};
	});
};

Persistence.prototype.updateWorklogItem = function updateWorklogItem (row, data) {
	return this.builder.update(data).where('id', row.id);
};

module.exports = function build (config) {
	var db = knex({
		client: 'pg',
		connection: config.uri
	});

	db.schema.hasTable(config.table).then(function hasTableResolved (hasTable) {
		if (!hasTable) {
			return db.schema.createTable(config.table, tableDefinition);
		}
	}).catch(function (error) {
		debug('failed to create work log storage table', error && error.stack || error);
	});

	return new Persistence(db(config.table));
};

function tableDefinition (t) {
	t.bigIncrements('id').primary();
	t.text('name');
	t.json('params');
	t.timestamp('started_at');
	t.timestamp('finished_at');
	t.text('error');
}
