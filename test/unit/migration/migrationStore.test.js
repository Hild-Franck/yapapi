import ava from 'ava'
import MongodbMemoryServer from 'mongodb-memory-server'
import mongoose from 'mongoose'

import { models } from '../../../src/database'
import migrationStore from '../../../src/database/migrationStore'

const mockSet = {
	lastRun: '1559657168668-migration-test.js',
	migrations: [{
		title: '1559657168668-migration-test.js',
		timestamp: Date.now()
	}]
}

const mongodb = new MongodbMemoryServer({ dbName: 'db' })

ava.before(async () => {
	const uri = await mongodb.getConnectionString()
	await mongoose.connect(uri, { database: 'db' })
})

ava.serial('return a state without migrations on init', async t => {
	const state = await migrationStore.init(models.migration)
	t.is(state.lastRun, "")
	t.true(state.migrating)
})

ava.serial('should return "up" migration direction on first migration', async t => {
	const state = await migrationStore.init(models.migration)
	t.is(migrationStore.getMigrationDir(state), 'up')
})

ava.serial('should load provided state', async t => {
	const state = await migrationStore.init(models.migration)
	const store = migrationStore.create(state)
	const returnedState = await new Promise(res => store.load((err, store) => res(store)))
	t.is(state, returnedState)
})

ava.serial('should create migration state on save', async t => {
	const state = await migrationStore.init(models.migration)
	const store = migrationStore.create(state)

	await new Promise(res => store.save(mockSet, res))

	const updatedState = await models.migration.findOne()

	t.false(updatedState.migrating)
	t.is(updatedState.migrations.length, 1)
})

ava.serial('should retrieve the previously created store on init', async t => {
	const state = await migrationStore.init(models.migration)
	t.true(state.migrating)
	t.is(state.migrations.length, 1)
})

ava.serial('should return no direction for the same migration', async t => {
	const state = await migrationStore.init(models.migration)
	
	t.is(migrationStore.getMigrationDir(state, mockSet.lastRun), "")
})

ava.serial('should save the new state', async t => {
	const state = await migrationStore.init(models.migration)
	const store = migrationStore.create(state)
	const newLastRun = `${mockSet.lastRun}42`
	await new Promise(res => store.save({...mockSet, lastRun: newLastRun}, res))
	const migration = await models.migration.findOne()
	t.is(migration.lastRun, newLastRun)
})