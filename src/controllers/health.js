import { wrap, sendResponse } from '../utils'

const get = wrap(async (req, res) => {
	const state = 'OK'
	sendResponse(res, state, { state })
})

export default { get }