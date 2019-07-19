const migration = mongoose => {
	const Migration = new mongoose.Schema({
		lastRun: { type: String, required: true },
		migrations: [{
			title: { type: String, required: true },
			timestamp: { type: Date, required: true }
		}],
		migrating: { type: Boolean, default: true }
	})
	return mongoose.model('Migration', Migration)
}

export default migration