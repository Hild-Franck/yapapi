import server from './server'
import logger from './logger'
import { appConfig } from './configs'

(async () => {
	logger.info('Running with the following config:', {
		label: 'index', meta: appConfig
	})
	server.start()
})()