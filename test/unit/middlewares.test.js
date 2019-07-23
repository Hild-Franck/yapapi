import ava from 'ava'
import endpointNotFound from '../../src/middlewares/404'
import errorHandler from '../../src/middlewares/errorHandler'

const check = {}

const res = {
	status: code => check.code = code,
	json: obj => check.obj = obj
}

const req = {
	method: 'GET',
	path: '/'
}

const resError = {
	status: code => check.codeError = code,
	json: obj => check.objError = obj
}

const reqError = {
	method: 'GET',
	path: '/'
}

const next = () => check.next = true

const error = new Error("test-error")
const secondError = new Error("test-error")
secondError.statusCode = 420

ava('No endpoint middleware should return 404 error', t => {
	endpointNotFound(req, res)
	
	t.is(check.code, 404)
	t.is(check.obj.error.statusError, 'Not Found')
})

ava('Error handler should pass to next middleware if no error', t => {
	errorHandler(null, null, null, next)

	t.true(check.next)
})

ava('Error handler should process non-boom errors', t => {
	errorHandler(error, reqError, resError, next)
	t.is(check.objError.statusCode, 500)

	errorHandler(secondError, reqError, resError, next)
	t.is(check.objError.statusCode, 420)
})

