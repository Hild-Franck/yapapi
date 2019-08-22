import ava from 'ava'
import request from 'supertest'
import MongodbMemoryServer from 'mongodb-memory-server'

import database, { models } from '../../../src/database'
import { app } from '../../../src/server'

const mongodb = new MongodbMemoryServer({ dbName: 'billing' })
const user = { email: 'test@test.com', username: 'Testy', password: '1234' }

ava.before(async () => { 
	const uri = await mongodb.getConnectionString()
	await database.init({
		host: uri.substring(10).split('/')[0],
		database: 'billing'
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
