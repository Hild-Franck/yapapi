import { wrap, sendResponse, getDateRange  } from '../utils'
import { models } from '../database'
import createError from '../errors'

const create = wrap(async (req, res) => {
	const query = req.body
	const note = await models.note.create({ ...query, user: req.user.id})
	
	sendResponse(res, 'Note created !', note)
})

const remove = wrap(async (req, res) => {
	const { id } = req.params
	const result = await models.note.findByIdAndDelete(id)
	
	if (!result)
		throw createError({error: 'Note does not exist', statusCode: 404})
	
	sendResponse(res, 'Note deleted', result._id)
})

const get = wrap(async (req, res) => {
	const { id } = req.params
	const note = await models.note.findById(id)
	
	sendResponse(res, '', note)
})

const update = wrap(async (req, res) => {
	const { id } = req.params

	const note = await models.note.findByIdAndUpdate(id, req.body, { new: true })

	sendResponse(res, 'Note updated !', note)
})

const getAll = wrap(async (req, res) => {
	const { month, year, date } = req.query
	const query = {}

	if (date) {
		const [ y, m, d ] = req.params.id.split("-")
		query.date = Date.UTC(y, m-1, d)
	} else if (month || year) {
		const dateRange = getDateRange(Number(month), year)
		query.date = { $gte: dateRange.start, $lte: dateRange.end }
	}

	const notes = await models.note.find(query)

	sendResponse(res, '', notes)
})

export default { create, update, remove, get, getAll }