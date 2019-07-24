const createError = (errorData, meta, label) => {
	const error = new Error(errorData.error)
	error.statusCode = errorData.statusCode
	error.meta = meta
	error.label = label || errorData.label
	error.id = errorData.id || ""
	error.expected = true
	return error
}

export * from './database'
export default createError