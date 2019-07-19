import ava from 'ava'
import request from 'supertest'

import { app } from '../../../src/server'

ava.serial('get `/health` should return 200', async t => {
	const res = await request(app).get('/health')

	t.is(res.status, 200)
})
