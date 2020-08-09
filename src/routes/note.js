import controllers from '../controllers'
import { createRestRoutes } from '../utils'

const noteRoutes = router => createRestRoutes(router, controllers.note)

export default noteRoutes