import { sha256 } from 'hash.js'

import { wrap, sendResponse } from '../utils'
import { models } from '../database'
import createError, {
	INVALID_AUTH_FORM,
	USER_CONFLICT,
	EMAIL_CONFLICT
} from '../errors'

const signup = wrap(async (req, res) => {
	const { username, password, email } = req.body

	if(!username || !password || !email)
		throw createError(INVALID_AUTH_FORM, { body: req.body }, 'auth.signup')
	if (await models.user.findOne({ username }))
		throw createError(USER_CONFLICT, { username }, 'auth.signup')
	if (await models.user.findOne({ email }))
		throw createError(EMAIL_CONFLICT, { email }, 'auth.signup')

	const salt = Math.random().toString(36).substring(2, 15)
	const hashedPassword = sha256().update(`${salt}${password}`).digest('hex')

	const user = await models.user.create({
		email,
		password: hashedPassword,
		salt,
		username
	})

	sendResponse(res, "User created", user)

})

export default { signup }