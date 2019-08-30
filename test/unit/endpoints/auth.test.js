import ava from 'ava'
import request from 'supertest'
import MongodbMemoryServer from 'mongodb-memory-server'
import { sha256 } from 'hash.js'

import database, { models } from '../../../src/database'
import { app } from '../../../src/server'
import token from '../../../src/token'

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

ava('post `/signup` should create and return an user', async t => {
	const res = await request(app)
		.post('/auth/signup')
		.send(user)
	
	const retrievedUser = models.user.findOne({ username: user.username })

	t.is(res.body.data.username, user.username)
	t.truthy(retrievedUser)
})

ava('post `/login` should return an user and a jwt cookie', async t => {
	const res = await request(app)
		.post('/auth/login')
		.send(testUser)

	t.truthy(res.headers['set-cookie'][0])
	t.is(res.body.data.username, createdUser.username)
})

ava('get /me should return user info from pretected route', async t => {
	const userToken = token.create({
		username: createdUser.username,
		id: createdUser._id
	})
	const res = await request(app)
		.get('/auth/me')
		.set('Authorization', `Bearer ${userToken}`)

	t.is(res.body.data.username, createdUser.username)	
})
