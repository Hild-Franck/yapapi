const createSchema = ({ Schema }) => new Schema({
	text: { type: String, required: true },
	important: { type: Boolean, default: false },
	date: { type: Date, required: true },
	user: { type: Schema.Types.ObjectId, required: true }
}, {
	timestamps: true,
	toObject: { virtuals: true },
	toJSON: { virtuals: true },
})

const note = mongoose => {
	const Note = createSchema(mongoose)
	Note.virtual('day').get(function() {
		return this.date.getUTCDate()
	})
	Note.virtual('month').get(function() {
		return this.date.getUTCMonth() + 1
	})
	Note.virtual('year').get(function() {
		return this.date.getUTCFullYear()
	})
	return mongoose.model('Note', Note)
}

export default note