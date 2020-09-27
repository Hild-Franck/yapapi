import migration from './migration'
import user from './user'
import mood from './mood'
import note from './note'
import habit from './habit'

// TODO: Make a createModels function instead of this object mutation abomination
const models = { migration, user, mood, note, habit }

export default models
