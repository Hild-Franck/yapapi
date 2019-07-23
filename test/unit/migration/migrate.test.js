import ava from 'ava'
import MongodbMemoryServer from 'mongodb-memory-server'
import path from 'path'

import database, { models } from '../../../src/database'
import migrationStore from '../../../src/database/migrationStore'

const mongodb = new MongodbMemoryServer({ dbName: 'db' })
const migrationFolder = path.join(__dirname, 'migrations')

ava.before(async () => {
	const uri = await mongodb.getConnectionString()
	await database.init({
		host: uri.substring(10).split('/')[0],
		database: 'billing',
		migrationFolder,
		currentMigration: ''
	})
	await models.migration.deleteMany({})
	migrationStore.currentState = null
})

ava.serial('Wrong store should return an error', async t => {
	try {
		await database.migrate({})
		t.fail()
	} catch(e) {
		t.pass()
	}
})

ava.serial('Migration should have created a migration state in the store', async t => {
	t.is(migrationStore.currentState, null)
	await database.migrate(migrationStore, models.migration, 'migrationMock.js')
	t.truthy(migrationStore.currentState._id)
})