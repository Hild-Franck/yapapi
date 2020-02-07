import ava from 'ava'
import request from 'supertest'
import MongodbMemoryServer from 'mongodb-memory-server'

import { app } from '../../../src/server'
import database from '../../../src/database'

const mongodb = new MongodbMemoryServer({ dbName: 'db' })

ava.afterEach('', async t => {
	const uri = await mongodb.getConnectionString()
	await database.init({
		host: uri.substring(10).split('/')[0],
		database: 'billing'
	})
})

ava.serial('get `/health` should return 500 if db is not initialized', async t => {
	const res = await request(app).get('/health')

	t.is(res.status, 500)
})

ava.serial('get `/health` should return 200 if db is initialized', async t => {
	const res = await request(app).get('/health')

	t.is(res.status, 200)
})
