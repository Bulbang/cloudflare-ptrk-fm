import { Router } from 'itty-router'
import { v4 } from 'uuid'
import { Env } from '../types/declarations/cfServices'
import { resize } from '../utils/resizer'
import { errorBuilder } from '../utils/response/errors'
import { errorResponse, okResponse } from '../utils/response/responses'
import { IRouteController } from './interfaces/IRouteController'

export class ImageRouteController implements IRouteController {
    constructor() {}
    initRoutes = (router: Router) => {
        router.get('/img/:id', this._getImg)
        router.post('/img', this._uploadImg)
    }
    private _getImg = async (
        req: Request & { params: { id: string } },
        env: Env,
    ) => {
        const { id } = req.params
        const url = new URL(req.url)
        const [width, height] = url.searchParams.has('size')
            ? url.searchParams.get('size').split('x')
            : [undefined, undefined]
        try {
            const img = await env.BUCKET.get(id)
            if (!img) {
                return errorResponse(
                    errorBuilder(404, `Image by id ${id} not found`),
                )
            }
            const imgBlob = await img.blob()
            if (width && height) {
                const resized = await resize({
                    width,
                    height,
                    imgBlob,
                    req,
                    env,
                })
                return resized
            }
            return new Response(imgBlob)
        } catch (error) {
            console.log(error.toString())
            return errorResponse(errorBuilder(500, 'Getting image error'))
        }
    }

    private _uploadImg = async (req: Request, env: Env) => {
        const contentType = req.headers.has('content-type')
            ? req.headers.get('content-type')
            : undefined
        const url = new URL(req.url)
        const fileId = url.searchParams.has('fileId')
            ? url.searchParams.get('fileId')
            : v4()

        if (!contentType) {
            return errorResponse(
                errorBuilder(400, 'content-type header is required'),
            )
        }

        try {
            await env.BUCKET.put(fileId, req.body, {
                httpMetadata: { contentType },
            })
            return okResponse({ fileId })
        } catch (error) {
            console.log(error)
            return errorResponse(errorBuilder(500, 'Putting image error'))
        }
    }
}
