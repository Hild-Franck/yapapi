import migration from './migration'
import user from './user'

const models = {
	create: mongoose => {
		models.migration = migration(mongoose)
		models.user = user(mongoose)
	},
}

export default models
