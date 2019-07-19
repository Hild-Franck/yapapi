const endpointNotFound = (req, res) => {
	res.status(404)
	res.json({
		statusCode: 404,
		message: `Cannot ${req.method} ${req.path}`,
		error: { statusError: 'Not Found' }
	})
}

export default endpointNotFound