import mongoose from 'mongoose'

import methods from './methods'

const transform = (doc, ret) => {
	delete ret.salt
	delete ret.password
}

const User = new mongoose.Schema({
	roles: { type: [String], default: ['user'] },
	email: { type: String, required: true, unique: true },
	username: { type: String, required: true, unique: true },
	password: { type: String, required: true },
	salt: { type: String, required: true }
}, {
	toObject: { virtuals: true, transform },
	toJSON: { virtuals: true, transform },
})

User.methods.isInScope = methods.isInScope

const user = mongoose.model('User', User)

export default user