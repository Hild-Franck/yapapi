import methods from './methods'

const transform = (doc, ret) => {
	delete ret.salt
	delete ret.password
}

const createSchema = mongoose => new mongoose.Schema({
	roles: { type: [String], default: ['user'] },
	email: { type: String, required: true, unique: true },
	username: { type: String, required: true, unique: true },
	password: { type: String, required: true },
	salt: { type: String, required: true }
}, {
	toObject: { virtuals: true, transform },
	toJSON: { virtuals: true, transform },
})

const user = mongoose => {
	const User = createSchema(mongoose)
	User.methods.isInScope = methods.isInScope
	return mongoose.model('User', User)
}

export default user