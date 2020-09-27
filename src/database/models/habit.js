import mongoose from 'mongoose'

const Habit = mongoose.Schema({
	desc: { type: String, required: true },
	dates: { type: [{
		date: { type: Date, required: true },
		done: { type: Boolean, required: true }
	}], default: [] },
	user: { type: mongoose.Schema.Types.ObjectId, required: true }
}, {
	timestamps: true,
	toObject: { virtuals: true },
	toJSON: { virtuals: true },
})

const habit = mongoose.model('Habit', Habit)

export default habit