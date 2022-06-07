import { Router } from 'itty-router'
import { ArticleRouteController } from './controllers/ArticleRouteController'
import { ImageRouteController } from './controllers/ImageRouteController'

import { RouteDirector } from './controllers/RouteDirector'
import { UtilsRouteController } from './controllers/UtilsRouteConrtoller'
import { ArticleRepository } from './repositories/ArticleRepository'

const articleRepository = new ArticleRepository()

const director = new RouteDirector(Router(), [
    new ArticleRouteController(articleRepository),
    new ImageRouteController(),
    new UtilsRouteController(),
])

const router = director.buildRouter()

export default {
    fetch: router.handle,
}
