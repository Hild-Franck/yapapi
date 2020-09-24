import migration from './migration'
import user from './user'
import mood from './mood'
import note from './note'
import habit from './habit'

// TODO: Make a createModels function instead of this object mutation abomination
const models = {
	// It shouldn't mutate this object
	create: mongoose => {
		models.migration = migration(mongoose)
		models.user = user(mongoose)
		models.mood = mood(mongoose)
		models.note = note(mongoose)
		models.habit = habit(mongoose)
	},
}

export default models
