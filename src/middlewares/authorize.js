import token from '../token'
import database from '../database'
import { wrap } from '../utils'
import createError, {
	LOW_CLEARANCE,
	NO_TOKEN,
	INVALID_TOKEN
} from '../errors'

const checkToken = async t => {
	try {
		const payload = token.verify(t)
		return payload
	} catch (err) {
		throw createError(INVALID_TOKEN)
	}
}

const authorize = scopes => wrap(async (req, res, next) => {
	const authorizationFromHeader = req.headers.authorization
	const authorizationFromCookie = req.cookies.jwt

	const userToken = authorizationFromHeader
		? authorizationFromHeader.substring(7)
		: authorizationFromCookie

	if (!userToken) throw createError(NO_TOKEN)
	const jwtPayload = await checkToken(userToken)
	const user = await database.models.user.findById(jwtPayload.id)
	
	if (scopes && !user.isInScope(scopes)) throw createError(LOW_CLEARANCE)

	req.user = user
	next()
})

export default authorize
