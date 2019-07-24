import ava from 'ava'
import MongodbMemoryServer from 'mongodb-memory-server'

import database, { models } from '../../../src/database'

const mongodb = new MongodbMemoryServer({ dbName: 'db' })

const user = {
	email: "asdfg",
	username: 'poulet',
	password: '1234',
	salt: 'qwerty'
}

ava.before(async () => {
	const uri = await mongodb.getConnectionString()
	await database.init({
		host: uri.substring(10).split('/')[0],
		database: 'billing'
	})
	await models.user.create(user)
})

ava.serial('User with default roles should be in "user" scope', async t => {
	const user = await models.user.findOne({})
	t.true(user.isInScope(["user"]))
	t.false(user.isInScope(["client"]))
})