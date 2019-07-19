import server from './server'
import database from './database'
import logger from './logger'
import { appConfig, dbConfig } from './configs'

(async () => {
	logger.info('Running with the following config:', {
		label: 'index', meta: appConfig
	})
	await database.init(dbConfig)
	server.start()
})()