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
		database: 'mainland',
		options : {
			useNewUrlParser: true,
			useUnifiedTopology: true
		},
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

ava.serial('should have created a migration state in the store', async t => {
	const state = await models.migration.findOne()
	t.is(state, null)
	await database.migrate(models.migration, '1316027432510-add-user.js')
	const migrations = await database.models.migration.find({})
	const newState = await models.migration.findOne()
	t.truthy(newState.migrations.length)
	t.false(migrations[0].migrating)
})

ava.serial('should execute the first migration', async t => {
	const firstTeam = await database.models.user.findOne({ email: "test@test.com" })
	const migrations = await database.models.migration.find({})
	t.truthy(firstTeam)
	t.is(firstTeam.username, "Test")
	t.false(migrations[0].migrating)
})

ava.serial('should execute the second migration', async t => {
	await database.migrate(models.migration, '1316027432511-add-character-to-username.js')
	const firstTeam = await database.models.user.findOne({ email: "test@test.com" })
	const migrations = await database.models.migration.find({})
	t.truthy(firstTeam)
	t.is(firstTeam.username, "NTest")
	t.false(migrations[0].migrating)
})

ava.serial('should execute the third migration', async t => {
	await database.migrate(models.migration, '1316027432512-add-character-to-username.js')
	const firstTeam = await database.models.user.findOne({ email: "test@test.com" })
	const migrations = await database.models.migration.find({})
	t.is(firstTeam.username, "NNTest")
	t.truthy(firstTeam)
	t.false(migrations[0].migrating)
})

ava.serial('should execute all previous down migration when returning to the first one', async t => {
	await database.migrate(models.migration, '1316027432511-add-character-to-username.js')
	const firstTeam = await database.models.user.findOne({ email: "test@test.com" })
	const migrations = await database.models.migration.find({})
	t.truthy(firstTeam)
	t.is(firstTeam.username, "Test")
	t.false(migrations[0].migrating)
})

ava.serial('should have migration state set to false if a migration fail', async t => {
	await database.migrate(models.migration, "1316027432513-bad-migration.js")
	const migrations = await database.models.migration.find({})
	t.false(migrations[0].migrating)
	t.is(migrations[0].migrations[3].timestamp, null)
})

ava.serial('should execute ONLY previously failed migration with the fixed file', async t => {
	database.migrationFolder = path.join(__dirname, 'alt-migrations')
	await database.migrate(models.migration, "1316027432513-bad-migration.js")
	const firstTeam = await database.models.user.findOne({ email: "test@test.com" })
	const migrations = await database.models.migration.find({})
	t.false(migrations[0].migrating)
	t.true(/^SALUT-/.test(firstTeam.username))
	t.false(/NO$/.test(firstTeam.username))
})