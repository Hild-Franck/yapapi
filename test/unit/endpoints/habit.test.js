import ava from 'ava'
import request from 'supertest'
import MongodbMemoryServer from 'mongodb-memory-server'
import { sha256 } from 'hash.js'

import database, { models } from '../../../src/database'
import { app } from '../../../src/server'
import token from '../../../src/token'

const mongodb = new MongodbMemoryServer({ dbName: 'billing' })

const getHabits = userId => [
	{ desc: "Habit 1", user: userId, dates: [{ date: "2020-08-01", done: true }, { date: "2020-08-22", done: true }] },
	{ desc: "Habit 2", user: userId, dates: [{ date: "2020-08-22", done: true }] },
	{ desc: "Habit 3", user: userId },
	{ desc: "Habit 4", user: userId },
	{ desc: "Habit 5", user: userId },
]

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
	await Promise.all(getHabits(createdUser._id).map(habit => models.habit.create(habit)))
	userToken = token.create({
		username: createdUser.username,
		id: createdUser._id
	})
})

ava('get `/` return all habits', async t => {
	const res = await request(app)
		.get('/habit')
		.set('Authorization', `Bearer ${userToken}`)

	t.is(res.statusCode, 200)
	t.true(res.body.data.length >= 3)
})

ava('get `/?month=8&year=2020` return all august habits', async t => {
	const res = await request(app)
		.get('/habit?month=8&year=2020')
		.set('Authorization', `Bearer ${userToken}`)

	const augustHabits = res.body.data.reduce((acc, habit) => {
		return acc + habit.dates.length
	}, 0)
	t.is(res.statusCode, 200)
	t.true(res.body.data.length >= 3)
	t.is(augustHabits, 3)
})

ava('get `/?date=2020-08-22` return all august habits', async t => {
	const res = await request(app)
		.get('/habit?date=2020-08-22')
		.set('Authorization', `Bearer ${userToken}`)
	
	const augustHabits = res.body.data.reduce((acc, habit) => {
		return acc + habit.dates.length
	}, 0)

	t.is(res.statusCode, 200)
	t.true(res.body.data.length >= 3)
	t.is(augustHabits, 2)
})

ava('get `/:id` return the specified habit', async t => {
	const { _id } = await models.habit.findOne({ desc: "Habit 1" })
	const res = await request(app)
		.get(`/habit/${_id}`)
		.set('Authorization', `Bearer ${userToken}`)

	t.is(res.statusCode, 200)
	t.is(res.body.data.desc, "Habit 1")
})

ava('post `/` return the created habit', async t => {
	const res = await request(app)
		.post("/habit")
		.set('Authorization', `Bearer ${userToken}`)
		.send({ desc: "Habit 42" })

	t.is(res.statusCode, 200)
	t.is(res.body.data.desc, "Habit 42")
})

ava('delete `/:id` the id of the deleted habit', async t => {
	const { _id } = await models.habit.findOne({ desc: "Habit 4" })
	const res = await request(app)
		.delete(`/habit/${_id}`)
		.set('Authorization', `Bearer ${userToken}`)
	const deletedHabit = await models.habit.findOne({ desc: "Habit 4" })
	
	t.is(res.statusCode, 200)
	t.falsy(deletedHabit)
	t.is(res.body.data, _id.toString())
})

ava('post `/:id` return the updated habit', async t => {
	const { _id } = await models.habit.findOne({ desc: "Habit 3" })
	const res = await request(app)
		.post(`/habit/${_id}`)
		.set('Authorization', `Bearer ${userToken}`)
		.send({ desc: "Habit 24" })

	t.is(res.statusCode, 200)
	t.is(res.body.data.desc, "Habit 24")
})

ava('post `/achieve/:id/:date/:bool` return the updated habit data', async t => {
	const { _id } = await models.habit.findOne({ desc: "Habit 5" })
	const res = await request(app)
		.post(`/habit/achieve/${_id}/2020-07-04`)
		.set('Authorization', `Bearer ${userToken}`)
		.send({ done: true })
	const retrievedHabit = await models.habit.findOne({ desc: "Habit 5" })
	
	t.is(res.statusCode, 200)
	t.is(retrievedHabit.dates.length, 1)
	t.is(res.body.data.date, "2020-07-04")
})