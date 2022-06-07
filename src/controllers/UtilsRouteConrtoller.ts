import { Router } from 'itty-router'

import { Env } from '../types/declarations/cfServices'
import { getNotionBlocks } from '../utils/notion-utils'
import { errorBuilder } from '../utils/response/errors'
import { errorResponse, okResponse } from '../utils/response/responses'
import { toTranslit } from '../utils/slugUtils'
import { IRouteController } from './interfaces/IRouteController'

export class UtilsRouteController implements IRouteController {
    constructor() {}
    initRoutes = (router: Router) => {
        router.get('/notion-blocks', this._getNotionBlocks)
        router.get('/transliterate', this._generateSlug)
        router.options('/*', this._cors)
        router.all('/*', () => errorResponse(errorBuilder(404, 'Not found')))
    }
    private _generateSlug = async (req: Request): Promise<Response> => {
        const url = new URL(req.url)
        const title = url.searchParams.has('title')
            ? url.searchParams.get('title')
            : undefined
        if (!title)
            return errorResponse(
                errorBuilder(400, '"title" query string parameter is empty'),
            )
        const slug = toTranslit(title)
        return okResponse(slug)
    }
    private _getNotionBlocks = async (
        req: Request,
        env: Env,
    ): Promise<Response> => {
        const url = new URL(req.url)
        const notion_url = url.searchParams.has('notion_url')
            ? url.searchParams.get('notion_url')
            : undefined
        if (!notion_url) {
            return errorResponse(
                errorBuilder(
                    400,
                    '"notion_url" query string parameter is empty',
                ),
            )
        }
        try {
            const blocks = await getNotionBlocks(notion_url)
            return okResponse(blocks)
        } catch (error) {
            return errorResponse(error)
        }
    }

    private _cors = async (req: Request): Promise<Response> => {
        let headers = req.headers
        if (headers.get('Origin') !== null) {
            let respHeaders = {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET,PUT,POST,OPTIONS',
                'Access-Control-Max-Age': '86400',
                Vary: 'Origin',
                'Access-Control-Allow-Headers': '*',
            }

            return new Response(null, {
                headers: respHeaders,
            })
        } else {
            return new Response(null, {
                headers: {
                    Allow: 'GET, PUT, POST, OPTIONS',
                },
            })
        }
    }
}
