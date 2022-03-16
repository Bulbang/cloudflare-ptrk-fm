import { Router } from 'itty-router'
import { okResponse } from './common/responses'
import { authorizer } from './middlewares/authorizer'

const router = Router()

router.get('/', authorizer, (req)=> { return okResponse("", {status:200, statusText: "OK"}) })

router.get('/articles', () => {})

router.get('/articles/:id', () => {})

router.post('articles/create', ()=>{})

router.put('/articles/:id', ()=>{})

router.get('/getPresignUrl', ()=>{})

addEventListener('fetch', (e) => {
    e.respondWith(router.handle(e.request))
})
