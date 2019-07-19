import mongoose from 'mongoose'
import path from 'path'
import { load } from 'migrate'

import migrationStore from './migrationStore.js'
import models from './models'
import logger from '../logger'

const database = {
	initialized: false, // Just to make sure `database.init` is never called twice
	migrate: async (store, migrationModel, migration) => {
		await store.init(migrationModel)
		const set = await new Promise((res, rej) => load(
			{
				stateStore: store,
				migrationsDirectory: path.join(__dirname, 'migrations')
			},
			(err, set) => err ? rej(err) : res(set)
		))
		const migrationDirection = store.getMigrationDirection(migration)
		if (!migrationDirection) {
			store.currentState.migrating = false
			await store.currentState.save()
			logger.info('No migration needed', { label: 'migration' })
		} else {
			await new Promise((res, rej) => set.migrate(
				migrationDirection, migration, err => err ? rej(err) : res(set)
			))
		}
	},
	init: async config => {
		try {
			if (database.initialized) throw new Error("Database already initialized")
			const uri = `mongodb://${config.host}/${config.database}`
			logger.info('The database will be running with the following config:', {
				label: 'database', meta: { options: config.options }
			})
			await mongoose.connect(uri, config.options)
			database.initialized = true
			models.create(mongoose)
			try {
				await database.migrate(migrationStore, models.migration, config.currentMigration)
			} catch(e) {
				logger.error(e.message, { label: 'migration', meta: e })
				migrationStore.currentState.migrating = false
				migrationStore.currentState.save()
			}
			logger.info('MongoDB database initialized !', { label: 'database' })
		} catch (error) {
			logger.error(error.message, { label: 'database', meta: error })
		}
	}
}

export default database