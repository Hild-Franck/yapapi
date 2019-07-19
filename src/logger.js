import winston from 'winston'

import { appConfig } from './configs'

const {
	combine,
	timestamp,
	prettyPrint,
	printf,
	align,
	colorize,
	json
} = winston.format

const customLevels = {
	levels: { crit: 0, error: 1, warning: 2, info: 3, debug: 4 },
	colors: {
		crit: 'red',
		error: 'red',
		warning: 'yellow',
		info: 'white',
		debug:'grey'
	}
}

const timeFormat = 'DD/MM/YYYY HH:mm:ss'

const format = process.env.NODE_ENV === 'production'
	? combine(timestamp({ format: timeFormat }), json())
	: combine(
		winston.format(info => {
			info.level = info.level.toUpperCase()
			return info
		})(),
		align(),
		timestamp({ format: timeFormat }),
		colorize(),
		printf(({ level, message, label, timestamp, meta }) => {
			const labelDisplay = label ? `[${label}]` : ""
			const infoDisplay = `[${timestamp}][${level}]${labelDisplay}`
			const metaDisplay = meta ? `\n${JSON.stringify(meta, null, 2)}` : ''
			return `${appConfig.name}.${appConfig.version} ${infoDisplay} ${message}${metaDisplay}`
		}),
	)

const logger = winston.createLogger({
	levels: customLevels.levels,
	level: process.env.LOG_LEVEL || 'info',
	transports: [new winston.transports.Console({ format })],
	format: combine(
		timestamp(),
		prettyPrint()
	)
})

winston.addColors(customLevels.colors)

logger.stream = {
	write: message => logger.info(message, { label: 'express' })
}

export default logger