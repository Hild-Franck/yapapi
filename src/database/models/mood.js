const createSchema = ({ Schema }) => new Schema({
	score: { type: Number, required: true, validate: {
		validator: Number.isInteger
	}, min: 0, max: 7},
	date: { type: Date, required: true, unique: true },
	user: { type: Schema.Types.ObjectId, required: true }
}, {
	timestamps: true,
	toObject: { virtuals: true },
	toJSON: { virtuals: true },
})

const mood = mongoose => {
	const Mood = createSchema(mongoose)
	Mood.virtual('day').get(function() {
		return this.date.getUTCDate()
	})
	Mood.virtual('month').get(function() {
		return this.date.getUTCMonth() + 1
	})
	Mood.virtual('year').get(function() {
		return this.date.getUTCFullYear()
	})
	return mongoose.model('Mood', Mood)
}

export default mood