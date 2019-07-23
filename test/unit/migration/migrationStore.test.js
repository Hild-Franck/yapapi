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
	models.create(mongoose)
})

ava.serial('First init should not return a current state', async t => {
	await migrationStore.init(models.migration)
	t.is(migrationStore.currentState, null)
})

ava.serial('First migration should migrate to "up"', t => {
	t.is(migrationStore.getMigrationDirection(), 'up')
})

ava.serial('First migration should load an empty store', async t => {
	const store = await new Promise(res => migrationStore.load((err, store) => res(store)))
	t.is(Object.keys(store).length, 0)
})

ava.serial('First migration should create migration state on save', async t => {
	await new Promise(res => migrationStore.save(mockSet, res))
	t.false(migrationStore.currentState.migrating)
})

ava.serial('should retrieve the state store on init', async t => {
	await migrationStore.init(models.migration)
	t.true(migrationStore.currentState.migrating)
})

ava.serial('should return no diretion for the same migration', t => {
	t.is(migrationStore.getMigrationDirection(mockSet.lastRun), null)
})

ava.serial('should load the current state', async t => {
	const store = await new Promise(res => migrationStore.load((err, store) => res(store)))
	t.true(store.migrating)
})

ava.serial('should save the new state', async t => {
	const newLastRun = `${mockSet.lastRun}42`
	await new Promise(res => migrationStore.save({...mockSet, lastRun: newLastRun}, res))
	const migration = await models.migration.findOne()
	t.is(migration.lastRun, newLastRun)
})