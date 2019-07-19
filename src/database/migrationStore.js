import logger from '../logger.js'

const migrationStore =  {
	currentState: null,
	create: null,
	
	init: async migrationModel => {
		migrationStore.model = migrationModel
		const currentState = await migrationStore.model.findOne()
		if (currentState) {
			currentState.migrating = true
			await currentState.save()
		}
		migrationStore.currentState = currentState
		logger.info(`Migration store initialized`, {
			label: 'migration', meta: migrationStore.currentState
		})
	},

	getMigrationDirection: newMigration => {
		const currentState = migrationStore.currentState
		if (!currentState) return 'up'
		if (currentState.lastRun === newMigration || currentState.migrating)
			return null
		return currentState.migrations.map(m => m.title).includes(newMigration)
			? 'down'
			: 'up'
	},

	load: fn => {
		if (!migrationStore.currentState) {
			logger.warning(
				'No migration found. If this is the first migration, it is normal',
				{ label: 'migration' }
			)
			return fn(null, {})
		}

		fn(null, migrationStore.currentState)
	},

	save: async (set, fn) => {
		if (!migrationStore.currentState) {
			migrationStore.currentState = await migrationStore.model.create({
				...set, migrating: false
			})
		} else {
			migrationStore.currentState.migrating = false
			migrationStore.currentState.lastRun =  set.lastRun
			migrationStore.currentState.migrations =  set.migrations
			
			await migrationStore.currentState.save()
		}
		fn()
	}
}

export default migrationStore