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
	const authorization = req.headers.authorization
	const userToken = authorization ? authorization.substring(7) : ''
	if (!userToken) throw createError(NO_TOKEN)
	const jwtPayload = await checkToken(userToken)
	const user = await database.user.findById(jwtPayload.id)
	
	if (scopes && !user.isInScope(scopes)) throw createError(LOW_CLEARANCE)

	req.user = user
	next()
})

export default authorize
