import mongoose from 'mongoose'

const Migration = new mongoose.Schema({
	lastRun: { type: String },
	migrations: [{
		title: { type: String, required: true },
		timestamp: { type: Date }
	}],
	migrating: { type: Boolean, default: true }
})

const migration = mongoose.model('Migration', Migration)

export default migration