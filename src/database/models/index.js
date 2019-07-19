import migration from './migration'

const models = {
	create: mongoose => {
		models.migration = migration(mongoose)
	},
}

export default models
