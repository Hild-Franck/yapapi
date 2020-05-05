const createSchema = ({ Schema }) => new Schema({
	score: { type: Number, required: true, validate: {
		validator: Number.isInteger
	}, min: -4, max: 4},
	day: { type: Date, required: true, unique: true },
	user: { type: Schema.Types.ObjectId, required: true }
})

const mood = mongoose => {
	const Mood = createSchema(mongoose)
	return mongoose.model('Mood', Mood)
}

export default mood