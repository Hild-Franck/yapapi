// Wrapper used to catch any error throwed by a controller
export const wrap = fn => (...args) => fn(...args).catch(args[2])

export const sendResponse = (res, message, data) => {
	const statusCode = 200
	res.status(statusCode)
	res.json({ message, data, statusCode })
}