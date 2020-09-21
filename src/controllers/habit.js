import mongoose from 'mongoose'

import { wrap, sendResponse, getDateRange  } from '../utils'
import { models } from '../database'
import createError from '../errors'

const create = wrap(async (req, res) => {
	const query = req.body
	const habit = await models.habit.create({ ...query, user: req.user.id})
	
	sendResponse(res, 'Habit created !', habit)
})

const remove = wrap(async (req, res) => {
	const { id } = req.params
	const result = await models.habit.findOneAndDelete(
		{ _id: id, user: req.user.id }
	)
	
	if (!result)
		throw createError({error: 'Habit does not exist', statusCode: 404})
	
	sendResponse(res, 'Habit deleted', result.id)
})

const get = wrap(async (req, res) => {
	const { id } = req.params
	const habit = await models.habit.findOne({ _id: id, user: req.user.id })
	
	sendResponse(res, '', habit)
})

const update = wrap(async (req, res) => {
	const { id } = req.params
	const query = req.body
	const habit = await models.habit.findOneAndUpdate({ _id: id, user: req.user.id }, query, { new: true })

	sendResponse(res, 'Habit updated !', habit)
})

const getAll = wrap(async (req, res) => {
	const { month, year, date } = req.query
	let query = [{ $match: { user: mongoose.Types.ObjectId(req.user.id) } }]

	if (date) {
		const [ y, m, d ] = date.split("-")
		query = query.concat([{
			$project: { dates: {
				$filter: { input: "$dates", as: "dates", cond: { $eq: ["$$dates.date", new Date(Date.UTC(y, m-1, d))] } }
			} }
		}])
	} else if (month || year) {
		const dateRange = getDateRange(Number(month), year)
		query = query.concat([{
			$project: { dates: {
				$filter: { input: "$dates", as: "dates", cond: { $and: [
					{ $gte: ["$$dates.date", new Date(dateRange.start)] },
					{ $lte: ["$$dates.date", new Date(dateRange.end)] }
				] } }
			} }
		}])
	}
	const habits = await models.habit.aggregate(query)

	sendResponse(res, '', habits)
})

const achieve = wrap(async (req, res) => {
	const { date, id } = req.params
	const done = Boolean(req.body.done)
	const [ y, m, d ] = date.split("-")
	const habit = await models.habit.findOne(
		{ _id: id, user: req.user.id, "dates.date": new Date(Date.UTC(y, m-1, d)) }
	)
	if (habit) {
		await habit.updateOne({ "dates.$.done": done })
	} else {
		await models.habit.findOneAndUpdate({ _id: id, user: req.user.id }, { $push: { dates: { date, done } } })
	}
	
	sendResponse(res, '', { date, done })
})

export default { create, update, remove, get, getAll, achieve }