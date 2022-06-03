import { Router } from 'itty-router'

import { RouteController } from './controllers/RouteController'
import { ArticleRepository } from './repositories/ArticleRepository'

const routeController = new RouteController(Router(), new ArticleRepository())
const router = routeController.getRouter

export default {
    fetch: router.handle,
}
