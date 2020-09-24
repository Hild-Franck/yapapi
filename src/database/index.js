import mongoose from 'mongoose'
import path from 'path'
import { load } from 'migrate'

import migrationStore from './migrationStore.js'
import models from './models'
import logger from '../logger'
import createError, { DB_ALREADY_INITIALIZED } from '../errors'

const database = {
	initialized: false, // Just to make sure `database.init` is never called twice
	connection: {},
	models,
	migrationFolder: path.join(__dirname, 'migrations'),
	migrate: async (store, migrationModel, migration) => {
		await store.init(migrationModel)
		const set = await new Promise((res, rej) => load(
			{ stateStore: store, migrationsDirectory: database.migrationFolder },
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
			if (database.initialized) throw new createError(DB_ALREADY_INITIALIZED)
			if (config.migrationFolder) database.migrationFolder = config.migrationFolder
			const uri = `mongodb://${config.username}:${config.password}${config.host}/${config.database}`
			logger.info('The database will be running with the following config:', {
				label: 'database', meta: { options: config.options }
			})
			database.connection = (await mongoose.connect(uri, config.options)).connection
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

export { models }
