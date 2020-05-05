import { forEach } from 'lodash'

const REST = {
	create: 'post',
	update: 'post',
	remove: 'delete',
	get: 'get',
	getAll: 'get'
}

const getPath = controllerName => ['getAll', 'create'].includes(controllerName) ? '/' : '/:id'

// Wrapper used to catch any error throwed by a controller
export const wrap = fn => (...args) => fn(...args).catch(args[2])

export const sendResponse = (res, message, data, statusCode=200) => {
	res.status(statusCode)
	res.json({ message, data, statusCode })
}

export const createRestRoutes = (router, controller) =>
	(forEach(REST, (v, k) => router[v](getPath(k), controller[k])), router)

export const getDateRange = (month, year) => {
	if (!year) year = (new Date()).getFullYear()
	const mod = month ? 0 : 11
	month = month || 1

	return { start: Date.UTC(year, month-1, 1), end: Date.UTC(year, month+mod, 0) }
}