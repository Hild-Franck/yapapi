import controllers from '../controllers'

const authRoutes = router => {
	router.post('/signup', controllers.auth.signup)
	router.post('/login', controllers.auth.login)
	return router
}

export default authRoutes