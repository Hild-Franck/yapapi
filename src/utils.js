import { forEach } from 'lodash'

const REST = {
	create: 'post',
	update: 'post',
	delete: 'delete',
	get: 'get',
	getAll: 'get'
}

const getPath = controllerName => controllerName == 'get' ? '/' : '/:id'

// Wrapper used to catch any error throwed by a controller
export const wrap = fn => (...args) => fn(...args).catch(args[2])

export const sendResponse = (res, message, data, statusCode=200) => {
	res.status(statusCode)
	res.json({ message, data, statusCode })
}

export const createRestRoutes = (router, controller) =>
	(forEach(REST, (k, v) => router[v](getPath(k), controller[k])), router)