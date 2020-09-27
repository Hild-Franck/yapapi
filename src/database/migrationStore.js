import logger from '../logger.js'

const init = async migrationModel => {
	const state = await migrationModel.findOne()
	if (!state) return migrationModel.create({ migrating: true, lastRun: "" })
	if (state.migrating) {
		logger.warning("Migration already in progress", { label: "migration.init" })
		return state
	}
	state.migrating = true
	await state.save()
	return state	
}

const setMigrating = (state, migrating) => state.updateOne({ migrating })

const getMigrationDir = (state, migrationName) => {
	if (!state || !state.lastRun) return "up"
	if (state.lastRun === migrationName) return ""

	const migrations = state.migrations.sort().map(m => m.title)
	const migrationIndex = migrations.indexOf(migrationName)

	return migrationIndex > -1
		&& migrations.indexOf(state.lastRun) > migrationIndex
		? "down"
		: "up"
}

const create = state => ({
	load: fn => fn(null, state),
	save: async (set, fn) => {
		try {
			await state.updateOne({ ...set, migrating: false })
			fn(null)
		} catch (e) {
			fn(e)
		}
	}
})

export default { init, setMigrating, getMigrationDir, create }