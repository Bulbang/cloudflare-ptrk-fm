import { v4 } from 'uuid'

import { errorResponse, okResponse } from '../utils/response/responses'
import { Article, ArticleReqBody, TrimmedArticle } from '../types/article'
import { ArticleRepository } from '../repositories/ArticleRepository'
import { Router } from 'itty-router'
import { BodyValidator } from '../middlewares/validator'
import { articleCreateSchema } from '../types/schemas/articles-create'
import { articleUpdateSchema } from '../types/schemas/articles-update'
import { errorBuilder } from '../utils/response/errors'
import { isLatinWithoutWhitespace, toTranslit } from '../utils/slugUtils'
import { getNotionBlocks } from '../utils/notion-utils'
import { Env } from '../types/declarations/cfServices'
import { resize } from '../utils/resizer'

export class RouteController {
    constructor(
        private readonly _router: Router,
        private readonly _articleRepository: ArticleRepository,
    ) {
        this._initRoutes()
    }

    get getRouter() {
        return this._router
    }

    private _initRoutes = () => {
        this._router.get('/img/:id', this._getImg)
        this._router.post('/img', this._uploadImg)
        this._router.get('/articles', this._getArticles)
        this._router.get('/articles/:id', this._getArticle)
        this._router.post(
            '/articles/create',
            BodyValidator(articleCreateSchema),
            this._putArticle,
        )
        this._router.post(
            '/articles/refresh/:id',
            this._refreshNotionNotionBlocks,
        )
        this._router.put(
            '/articles/:id',
            BodyValidator(articleUpdateSchema),
            this._updateArticle,
        )
        this._router.get('/notion-blocks', this._getNotionBlocks)
        this._router.get('/transliterate', this._generateSlug)
        this._router.get('/resize', this._resize)
        this._router.options('/*', this._cors)
        this._router.all('/*', () =>
            errorResponse(errorBuilder(404, 'Not found')),
        )
    }

    private _resize = async (req: Request, env: Env) => {
        const id = '424d08e1-9299-4710-b008-00ed9e8d47e9'
        try {
            const img = await env.BUCKET.get(id)
            const formData = new FormData()
            formData.append('image', await img.blob())
            const reqToResize = new Request(req, {
                body: formData,
                method: 'POST',
            })

            const u8Res = await env.RESIZER.fetch(reqToResize)
            const ab = await u8Res.arrayBuffer()
            const bytes = new Uint8Array(ab)
            const blob = new Blob([ab], { type: 'image/jpeg' })
            return new Response(ab, {
                headers: { 'Content-Type': 'image/jpeg' },
            })
        } catch (error) {
            console.log(error.toString())
            return errorResponse(errorBuilder(500, 'Getting image error'))
        }
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

    private _getArticles = async (
        req: Request,
        env: Env,
    ): Promise<Response> => {
        this._articleRepository.kvNamespace = env.ARTICLES
        try {
            const url = new URL(req.url)
            const articles = await this._articleRepository.getMany({
                sortByDate: url.searchParams.get('sortByDate'),
            })
            return okResponse<TrimmedArticle[]>(articles)
        } catch (error) {
            return errorResponse(error)
        }
    }

    private _getArticle = async (
        req: Request & { params: { id: string } },
        env: Env,
    ): Promise<Response> => {
        this._articleRepository.kvNamespace = env.ARTICLES
        try {
            const article = await this._articleRepository.getById(req.params.id)
            return okResponse<Article>(article)
        } catch (error) {
            console.log(error)
            return errorResponse(error)
        }
    }

    private _putArticle = async (req: Request, env: Env): Promise<Response> => {
        const body = await req.json<ArticleReqBody>()
        const {
            title,
            meta_description,
            meta_title,
            file_id,
            notion_url,
            slug,
            notion_blocks,
        } = body

        if (!isLatinWithoutWhitespace(slug.toLowerCase()))
            return errorResponse(errorBuilder(400, 'Invalid slug'))

        const article = {
            title,
            meta_title,
            meta_description,
            file_id,
            notion_url,
            slug: slug.toLowerCase(),
            notion_blocks,
        }
        this._articleRepository.kvNamespace = env.ARTICLES
        try {
            const newArticle = await this._articleRepository.putData(article)
            return okResponse(newArticle)
        } catch (error) {
            return errorResponse(error)
        }
    }

    private _updateArticle = async (
        req: Request & { params: { id: string } },
        env: Env,
    ): Promise<Response> => {
        this._articleRepository.kvNamespace = env.ARTICLES
        try {
            const idOfArticleToUpdate = req.params.id
            const dataToUpdate = await req.json<ArticleReqBody>()
            const res = await this._articleRepository.updateData(
                idOfArticleToUpdate,
                dataToUpdate,
            )
            return okResponse(res)
        } catch (error) {
            return errorResponse(error)
        }
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
            const notion_blocks = await getNotionBlocks(notion_url)
            return okResponse(notion_blocks)
        } catch (error) {
            return errorResponse(error)
        }
    }
    private _refreshNotionNotionBlocks = async (
        req: Request & { params: { id: string } },
        env: Env,
    ): Promise<Response> => {
        this._articleRepository.kvNamespace = env.ARTICLES
        const { id } = req.params
        try {
            const refreshedArticle =
                await this._articleRepository.refreshNotionBlocks(id)
            return okResponse(refreshedArticle)
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
