import { Router } from 'itty-router'

import { RouteController } from './controllers/RouteController'
import { authorizer } from './middlewares/authorizer'
import { BodyValidator } from './middlewares/validator'
import { articlesCreateSchema } from './types/schemas/articles-create'
import { articleUpdateSchema } from './types/schemas/articles-update'

const router = Router()
const routeController = new RouteController()
router.post(
    '/',
    authorizer,
    BodyValidator(articlesCreateSchema),
    routeController.putArticle,
)

router.get('/articles', routeController.getArticles)

router.get('/articles/:id', routeController.getArticle)

router.post(
    '/articles/create',
    authorizer,
    BodyValidator(articlesCreateSchema),
    routeController.putArticle,
)

router.put(
    '/articles/:id',
    authorizer,
    BodyValidator(articleUpdateSchema),
    routeController.updateArticle,
)

router.get('/getPresignUrl', authorizer, routeController.createPresignPost)

addEventListener('fetch', (e) => {
    e.respondWith(router.handle(e.request))
})
