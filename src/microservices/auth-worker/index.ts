import { Router } from 'itty-router'

function parseCredentials(authorization: string) {
    const parts = authorization.split(' ')
    const plainAuth = atob(parts[1])
    const credentials = plainAuth.split(':')
    return credentials
}

function getUnauthorizedResponse(message: string) {
    let response = new Response(message, {
        status: 401,
    })
    response.headers.set('WWW-Authenticate', `Basic realm="admin.ptrk.fm"`)
    return response
}
const router = Router()

router.all('*', async (request: Request) => {
    const authorization = request.headers.has('authorization')
        ? request.headers.get('authorization')
        : undefined
    if (!authorization) {
        return getUnauthorizedResponse(
            'Provide User Name and Password to access this page.',
        )
    }
    const credentials = parseCredentials(authorization)
    if (credentials[0] !== LOGIN || credentials[1] !== PASSWORD) {
        return getUnauthorizedResponse(
            'The User Name and Password combination you have entered is invalid.',
        )
    }
    const url = new URL(request.url)
    const res = await fetch(url, request)
    return res
})

addEventListener('fetch', (event) => {
    event.respondWith(router.handle(event.request))
})
