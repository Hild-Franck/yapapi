import express from 'express'

import healthRoutes from './health'
import authRoutes from './auth'
import moodRoutes from './mood'
import authorize from '../middlewares/authorize'


const routes = {
	create: app => {
		const Router = express.Router
		app.use('/health', healthRoutes(Router()))
		app.use('/auth', authRoutes(Router()))
		app.use('/mood', authorize(['user']), moodRoutes(Router()))
	}
}

export default routes
