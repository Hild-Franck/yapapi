import { sha256 } from 'hash.js'

import { wrap, sendResponse } from '../utils'
import token from '../token'
import { models } from '../database'
import { dbConfig } from '../configs'
import createError, {
	INVALID_AUTH_FORM,
	USER_CONFLICT,
	EMAIL_CONFLICT,
	NO_USER,
	WRONG_PASSWORD
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
	const hashedPwd = sha256()
		.update(`${dbConfig.pepper}${salt}${password}`)
		.digest('hex')

	const user = await models.user.create({
		email,
		password: hashedPwd,
		salt,
		username
	})

	sendResponse(res, "User created", user)

})

const login = wrap(async (req, res) => {
	const { username, password } = req.body

	if(!username || !password)
		throw createError(INVALID_AUTH_FORM, { body: req.body }, 'auth.login')

	const user = await models.user.findOne({ username })

	if (!user) throw createError(NO_USER, { body: req.body }, 'auth.login')

	const hashedPwd = sha256().update(`${user.salt}${password}`).digest('hex')

	if (hashedPwd !== user.password)
		throw createError(WRONG_PASSWORD, { body: req.body }, 'auth.login')

	res.cookie('jwt', token.create({ id: user._id, username: user.username }))
	sendResponse(res, "User retrieved", user)

})

const me = wrap(async (req, res) => {
	sendResponse(res, '', req.user)

})

export default { signup, login, me }