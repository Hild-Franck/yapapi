import ava from 'ava'
import request from 'supertest'
import MongodbMemoryServer from 'mongodb-memory-server'
import { sha256 } from 'hash.js'

import database, { models } from '../../../src/database'
import { app } from '../../../src/server'
import token from '../../../src/token'

const mongodb = new MongodbMemoryServer({ dbName: 'billing' })
const moodToGet = { score: 4, date: '2001-01-01' }
const moodTGoetAgain = { score: 4, date: '2001-01-05' }
const moodToDelete = { score: 3, date: '2001-01-02' }
const moodToCreate = { score: 2, date: '2001-01-03' }
const moodToUpdate = { score: 1, date: '2001-01-04' }
const user = {
	email: 'testy@test.com',
	username: 'Testy',
	password: '1234',
	salt: Math.random().toString(36).substring(2, 15)
}

let userToken = ''

ava.before(async () => { 
	const uri = await mongodb.getConnectionString()
	await database.init({
		host: uri.substring(10).split('/')[0],
		database: 'billing'
	})
	const createdUser = await models.user.create({
		...user,
		password: sha256().update(`${user.salt}${user.password}`).digest('hex')
	})
	userToken = token.create({
		username: createdUser.username,
		id: createdUser._id
	})

	await models.mood.create({ ...moodToDelete, user: createdUser._id})
	await models.mood.create({ ...moodToGet, user: createdUser._id})
	await models.mood.create({ ...moodTGoetAgain, user: createdUser._id})
	await models.mood.create({ ...moodToUpdate, user: createdUser._id})

})

ava('post `/mood` should create and return a mood', async t => {
	const res = await request(app)
		.post('/mood')
		.set('Authorization', `Bearer ${userToken}`)
		.send(moodToCreate)
	
	const retrievedMood = await models.mood.findOne({ date: new Date(moodToCreate.date) })
	
	t.is(res.statusCode, 200)
	t.truthy(retrievedMood)
})

ava('delete `/mood/:day` should create and return a mood', async t => {
	const res = await request(app)
		.delete(`/mood/${moodToDelete.date}`)
		.set('Authorization', `Bearer ${userToken}`)
	
	const retrievedMood = await models.mood.findOne({ date: new Date(moodToDelete.date) })
	
	t.is(res.statusCode, 200)
	t.falsy(retrievedMood)
})

ava('get `/mood/:day` should create and return a mood', async t => {
	const res = await request(app)
		.get(`/mood/${moodToGet.date}`)
		.set('Authorization', `Bearer ${userToken}`)
	
	const retrievedMood = await models.mood.findOne({ date: new Date(moodToGet.date) })
	
	t.is(res.statusCode, 200)
	t.truthy(retrievedMood)
})

ava('post `/mood/:day` should create and return a mood', async t => {
	const res = await request(app)
		.post(`/mood/${moodToUpdate.date}`)
		.set('Authorization', `Bearer ${userToken}`)
		.send({score: -4})
	
	const retrievedMood = await models.mood.findOne({ date: new Date(moodToUpdate.date) })
	
	t.is(res.statusCode, 200)
	t.is(retrievedMood.score, -4)
})

ava('get `/mood` should create and return a mood', async t => {
	const res = await request(app)
		.get('/mood')
		.set('Authorization', `Bearer ${userToken}`)
		.query({ month: 1, year: 2001, score: 4 })
	
	t.is(res.statusCode, 200)
	t.is(res.body.data.length, 2)
})