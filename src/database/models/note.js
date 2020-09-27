import mongoose from 'mongoose'

const Note = new mongoose.Schema({
	text: { type: String, required: true },
	important: { type: Boolean, default: false },
	date: { type: Date, required: true },
	user: { type: mongoose.Schema.Types.ObjectId, required: true }
}, {
	timestamps: true,
	toObject: { virtuals: true },
	toJSON: { virtuals: true },
})

Note.virtual('day').get(function() {
	return this.date.getUTCDate()
})
Note.virtual('month').get(function() {
	return this.date.getUTCMonth() + 1
})
Note.virtual('year').get(function() {
	return this.date.getUTCFullYear()
})

const note = mongoose.model('Note', Note)

export default note