import controllers from '../controllers'
import authorize from '../middlewares/authorize'

const authRoutes = router => {
	router.post('/signup', controllers.auth.signup)
	router.post('/login', controllers.auth.login)
	router.get('/me', authorize(['user']), controllers.auth.me)
	router.get('/logout', controllers.auth.logout)
	return router
}

export default authRoutes