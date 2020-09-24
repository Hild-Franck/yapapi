const createSchema = ({ Schema }) => new Schema({
	desc: { type: String, required: true },
	dates: { type: [{
		date: { type: Date, required: true },
		done: { type: Boolean, required: true }
	}], default: [] },
	user: { type: Schema.Types.ObjectId, required: true }
}, {
	timestamps: true,
	toObject: { virtuals: true },
	toJSON: { virtuals: true },
})

const habit = mongoose => {
	const Habit = createSchema(mongoose)
	return mongoose.model('Habit', Habit)
}

export default habit