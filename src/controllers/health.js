import database from '../database'
import { wrap, sendResponse } from '../utils'

const get = wrap(async (req, res) => {
	const state = database.connection.readyState
	sendResponse(
		res,
		state == 1 ? 'OK' : 'Not connected to mongodb',
		{ state },
		state == 1 ? 200 : 500,
	)
})

export default { get }