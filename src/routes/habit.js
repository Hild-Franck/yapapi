import controllers from '../controllers'
import authorize from '../middlewares/authorize'
import { createRestRoutes } from '../utils'

const habitRoutes = router => {
	const updatedRouter = createRestRoutes(router, controllers.habit)
	updatedRouter.post('/achieve/:id/:date', authorize(["user"]), controllers.habit.achieve)
	return updatedRouter
}

export default habitRoutes