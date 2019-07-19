import mongoose from 'mongoose'

import logger from '../logger'

const database = {
	initialized: false, // Just to make sure `database.init` is never called twice
	init: async config => {
		if (database.initialized) throw new Error("Database already initialized")
		try {
			const uri = `mongodb://${config.host}/${config.database}`
			logger.info('The database will be running with the following config:', {
				label: 'database', meta: { options: config.options }
			})
			await mongoose.connect(uri, config.options)
			database.initialized = true
			logger.info('MongoDB database initialized !', { label: 'database' })
		} catch (error) {
			logger.error(error.message, { label: 'database', meta: error })
		}
	}
}

export default database