import controllers from '../controllers'

const healthRoutes = router => {
	router.get('/', controllers.health.get)
	return router
}

export default healthRoutes