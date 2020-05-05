import { wrap, sendResponse, getDateRange  } from '../utils'
import { models } from '../database'
import createError from '../errors'

const create = wrap(async (req, res) => {
	const query = req.body

	const mood = await models.mood.create({ ...query, user: req.user.id})
	sendResponse(res, '', mood)
})

const remove = wrap(async (req, res) => {
	const { id } = req.params
	const query = { day: id }

	const result = await models.mood.deleteOne(query)
	
	if (result.deletedCount === 0) throw createError({error: 'Item does not exist', statusCode: 404})
	
	sendResponse(res, '', result)
})

const get = wrap(async (req, res) => {
	const { id } = req.params
	const query = { day: id }

	const mood = await models.mood.findOne(query)
	sendResponse(res, '', mood)
})

const update = wrap(async (req, res) => {
	const { score } = req.body
	const { id } = req.params
	const query = { day: id }

	const mood = await models.mood.update(query, { score })

	sendResponse(res, '', mood)
})

const getAll = wrap(async (req, res) => {
	const { month, year, score } = req.query
	const query = {}
	if (month || year){
		const dateRange = getDateRange(month, year)
		query.day = { $gte: dateRange.start, $lte: dateRange.end }
	}
	
	if (score) query.score = score
	
	const moods = await models.mood.find(query)

	sendResponse(res, '', moods)
})

export default { create, update, remove, get, getAll }