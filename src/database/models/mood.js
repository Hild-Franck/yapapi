import mongoose from 'mongoose'

const Mood = new mongoose.Schema({
	score: { type: Number, required: true, validate: {
		validator: Number.isInteger
	}, min: 0, max: 7},
	date: { type: Date, required: true, unique: true },
	user: { type: mongoose.Schema.Types.ObjectId, required: true }
}, {
	timestamps: true,
	toObject: { virtuals: true },
	toJSON: { virtuals: true },
})

Mood.virtual('day').get(function() {
	return this.date.getUTCDate()
})
Mood.virtual('month').get(function() {
	return this.date.getUTCMonth() + 1
})
Mood.virtual('year').get(function() {
	return this.date.getUTCFullYear()
})

const mood = mongoose.model('Mood', Mood)

export default mood