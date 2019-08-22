import controllers from '../controllers'

const authRoutes = router => {
	router.post('/signup', controllers.auth.signup)
	return router
}

export default authRoutes