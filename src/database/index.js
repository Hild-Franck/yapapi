import mongoose from 'mongoose'
import path from 'path'
import { load } from 'migrate'

import migrationStore from './migrationStore.js'
import models from './models'
import logger from '../logger'
import createError, { DB_ALREADY_INITIALIZED } from '../errors'

mongoose.set('useFindAndModify', false)

const asyncLoad = config => new Promise((res, rej) =>
	load(config, (err, set) => err ? rej(err) : res(set)))

const getUri = config => config.uri
	? config.uri
	: `mongodb://${config.host}/${config.database}`

const database = {
	initialized: false, // Just to make sure `database.init` is never called twice
	connection: {},
	models,
	migrationFolder: path.join(__dirname, 'migrations'),
	migrate: async (migrationModel, migration) => {
		const state = await migrationStore.init(migrationModel)
		const set = await asyncLoad({
			stateStore: migrationStore.create(state),
			migrationsDirectory: database.migrationFolder
		})
		
		const migrationDirection = migrationStore.getMigrationDir(state, migration)
		
		if (!migrationDirection || !migration) {
			logger.info('No migration needed', { label: 'migration' })
			await migrationStore.setMigrating(state, false)
		} else {
			try {
				logger.info(`Doing migration: ${migrationDirection} from ${migration}`)
				await new Promise((res, rej) => set.migrate(
					migrationDirection, migration, err => err ? rej(err) : res(set)
				))
				await migrationStore.setMigrating(state, false)
			} catch (e) {
				logger.error(e.message, { label: 'migration', meta: e })
				await migrationStore.setMigrating(state, false)
			}
		}
	},
	setConnection: ({ connection }) => {
		database.connection = connection
		database.initialized = true
	},
	init: async config => {
		try {
			if (database.initialized) throw new createError(DB_ALREADY_INITIALIZED)
			if (config.migrationFolder)
				database.migrationFolder = config.migrationFolder
			const uri = getUri(config)
			logger.info('The database will be running with the following config:', {
				label: 'database', meta: { options: config.options }
			})
			database.setConnection(await mongoose.connect(uri, config.options))
			try {
				await database.migrate(models.migration, config.currentMigration)
			} catch(e) {
				logger.error(e.message, { label: 'migration', meta: e })
			}
			logger.info('MongoDB database initialized !', { label: 'database' })
		} catch (error) {
			logger.error(error.message, { label: 'database', meta: error })
		}
	}
}

export default database
export { models }
