import ava from 'ava'
import request from 'supertest'
import MongodbMemoryServer from 'mongodb-memory-server'
import { sha256 } from 'hash.js'

import database, { models } from '../../../src/database'
import { app } from '../../../src/server'
import token from '../../../src/token'
import {
	INVALID_AUTH_FORM,
	USER_CONFLICT,
	EMAIL_CONFLICT,
	NO_USER,
	WRONG_PASSWORD,
	NO_TOKEN,
	INVALID_TOKEN
} from '../../../src/errors'

const mongodb = new MongodbMemoryServer({ dbName: 'billing' })
const user = { email: 'test@test.com', username: 'Test', password: '1234' }
const testUser = {
	email: 'testy@test.com',
	username: 'Testy',
	password: '1234',
	salt: Math.random().toString(36).substring(2, 15)
}

let createdUser = null

ava.before(async () => { 
	const uri = await mongodb.getConnectionString()
	await database.init({
		host: uri.substring(10).split('/')[0],
		database: 'billing'
	})
	createdUser = await models.user.create({
		...testUser,
		password: sha256().update(`${testUser.salt}${testUser.password}`).digest('hex')
	})
})

ava('post `/signup` with an incomplete form should return an error', async t => {
	const res = await request(app)
		.post('/auth/signup')
		.send({ password: user.password, username: user.username })

	t.truthy(res.body.error)
	t.is(res.body.message, INVALID_AUTH_FORM.error)
})

ava('post `/signup` with an existing username should return an error', async t => {
	const res = await request(app)
		.post('/auth/signup')
		.send(testUser)

	t.truthy(res.body.error)
	t.is(res.body.message, USER_CONFLICT.error)
})

ava('post `/signup` with an existing email should return an error', async t => {
	const res = await request(app)
		.post('/auth/signup')
		.send({ ...testUser, username: 'SuperPoulet' })

	t.truthy(res.body.error)
	t.is(res.body.message, EMAIL_CONFLICT.error)
})

ava('post `/login` with an incomplete form should return an error', async t => {
	const res = await request(app)
		.post('/auth/login')
		.send({ password: user.password })

	t.truthy(res.body.error)
	t.is(res.body.message, INVALID_AUTH_FORM.error)
})

ava('post `/login` with an unknown user should return an error', async t => {
	const res = await request(app)
		.post('/auth/login')
		.send({ password: user.password, username: 'Jesus' })

	t.truthy(res.body.error)
	t.is(res.body.message, NO_USER.error)
})

ava('post `/login` with a wrong password should return an error', async t => {
	const res = await request(app)
		.post('/auth/login')
		.send({ password: 'wrongPassword', username: createdUser.username })

	t.truthy(res.body.error)
	t.is(res.body.message, WRONG_PASSWORD.error)
})

ava('get /me should return an error if no token provided', async t => {
	const res = await request(app)
		.get('/auth/me')

	t.truthy(res.body.error)
	t.is(res.body.message, NO_TOKEN.error)
})

ava('get /me should return an error if wrong token provided', async t => {
	const res = await request(app)
		.get('/auth/me')
		.set('Authorization', `Bearer Poulet`)
		
	t.truthy(res.body.error)
	t.is(res.body.message, INVALID_TOKEN.error)
})