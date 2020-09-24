import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import morgan from 'morgan'

import logger from './logger'
import routes from './routes'
import errorHandler from './middlewares/errorHandler'
import endpointNotFound from './middlewares/404'

const port = process.env.PORT || 9000
const logType = process.env.NODE_ENV === "production" ? "tiny" : "dev"

const app = express()

app.use(morgan(logType, { stream: logger.stream }))
app.use(cors({ origin: (_, cb) => cb(null, true), credentials: true }))
app.use(bodyParser.json())
app.use(cookieParser())
routes.create(app)
app.use(errorHandler)
app.use(endpointNotFound)

const server = {
	start: () => app.listen(port, () => logger.info(
		`Server listening on port ${port}`,
		{ label: 'server' }
	))
}

export default server
// Exposing app mainly for test purpose, but it can always become handy
export { app }