import logger from '../logger'
import Boom from 'boom'

const errorHandler = (err, req, res, next) => {
	if (!err) return next()
	if (!err.isBoom) {
		const statusCode = err.statusCode || 500
		err = Boom.boomify(err, { statusCode, id: err.id || "" })
	}
	logger.error(err.message, {
		label: err.label || 'error-handler', meta: err.meta || null
	})

	if (!err.expected)
		logger.error(`Error was unexpected: ${err.stack}`, { label: 'stack-trace' })
	
	res.status(err.output.statusCode)
	
	const { statusCode, error, message } = err.output.payload
	
	return res.json({
		statusCode,
		message,
		error: { statusMessage: error, id: err.id }
	})
}

export default errorHandler