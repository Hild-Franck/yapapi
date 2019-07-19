import express from 'express'

import healthRoutes from './health'


const routes = {
	create: app => {
		const Router = express.Router
		app.use('/health', healthRoutes(Router()))
	}
}

export default routes
