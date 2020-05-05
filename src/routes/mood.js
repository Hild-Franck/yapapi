import controllers from '../controllers'
import { createRestRoutes } from '../utils'

const moodRoutes = router => createRestRoutes(router, controllers.mood)

export default moodRoutes