import methods from './methods'

const createSchema = mongoose => new mongoose.Schema({
	roles: { type: [String], default: ['user'] },
	email: { type: String, required: true, unique: true },
	username: { type: String, required: true, unique: true },
	password: { type: String, required: true },
	salt: { type: String, required: true }
}, {
	toObject: { virtuals: true },
	toJSON: { virtuals: true },
})

const user = mongoose => {
	const User = createSchema(mongoose)
	User.methods.isInScope = methods.isInScope
	return mongoose.model('User', User)
}

export default user