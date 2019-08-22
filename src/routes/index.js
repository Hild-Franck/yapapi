import express from 'express'

import healthRoutes from './health'
import authRoutes from './auth'


const routes = {
	create: app => {
		const Router = express.Router
		app.use('/health', healthRoutes(Router()))
		app.use('/auth', authRoutes(Router()))
	}
}

export default routes
