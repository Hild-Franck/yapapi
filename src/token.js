const jwt = require('jsonwebtoken')

const secret = process.env.SECRET

const token = {
	create: ({ id, username }) => jwt.sign({ id, username }, secret),
	verify: token => jwt.verify(token, secret)
}

module.exports = token