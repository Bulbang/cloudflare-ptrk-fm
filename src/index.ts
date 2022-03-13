import { Router } from 'itty-router'
import { errorResponse, okResponse } from './common/responses'

import { unauthorized, badRequest} from '@hapi/boom'

const router = Router()


router.get('/', () => {
    return okResponse<{ hello: string }>(
        { hello: `${LOGIN}:${PASSWORD}` },
        { status: 200, statusText: 'OK' },
    )
})

router.get('/error-with-payload', () => {
    return errorResponse(unauthorized('Putin'))
})

router.get('/error-without-payload', () => {
    return errorResponse(badRequest('Huy'))
})

addEventListener('fetch', (e) => {
    e.respondWith(router.handle(e.request))
})
