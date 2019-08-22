import ava from 'ava'
import request from 'supertest'
import MongodbMemoryServer from 'mongodb-memory-server'
import { sha256 } from 'hash.js'

import database, { models } from '../../../src/database'
import { app } from '../../../src/server'

const mongodb = new MongodbMemoryServer({ dbName: 'billing' })
const user = { email: 'test@test.com', username: 'Test', password: '1234' }
const createdUser = {
	email: 'testy@test.com',
	username: 'Testy',
	password: '1234',
	salt: Math.random().toString(36).substring(2, 15)
}

ava.before(async () => { 
	const uri = await mongodb.getConnectionString()
	await database.init({
		host: uri.substring(10).split('/')[0],
		database: 'billing'
	})
	await models.user.create({
		...createdUser,
		password: sha256().update(`${createdUser.salt}${createdUser.password}`).digest('hex')
	})
})

ava.serial('post `/signup` should create and return an user', async t => {
	const res = await request(app)
		.post('/auth/signup')
		.send(user)
	
	const createdUser = models.user.findOne({ username: user.username })

	t.is(res.body.data.username, user.username)
	t.truthy(createdUser)
})

ava.serial('post `/login` should return an user and a jwt cookie', async t => {
	const res = await request(app)
		.post('/auth/login')
		.send(createdUser)

	t.truthy(res.headers['set-cookie'][0])
	t.is(res.body.data.username, createdUser.username)
})
