import { Router } from 'itty-router'
import { v4 } from 'uuid'
import { BodyValidator } from '../middlewares/validator'
import { ArticleRepository } from '../repositories/ArticleRepository'
import { TrimmedArticle, Article, ArticleReqBody } from '../types/article'
import { Env } from '../types/declarations/cfServices'
import { articleCreateSchema } from '../types/schemas/articles-create'
import { articleUpdateSchema } from '../types/schemas/articles-update'
import { errorBuilder } from '../utils/response/errors'
import { errorResponse, okResponse } from '../utils/response/responses'
import { isLatinWithoutWhitespace } from '../utils/slugUtils'
import { IRouteController } from './interfaces/IRouteController'

export class ArticleRouteController implements IRouteController {
    constructor(private _articleRepository: ArticleRepository) {}
    initRoutes = (router: Router) => {
        router.get('/articles', this._getArticles)
        router.get('/articles/:id', this._getArticle)
        router.post(
            '/articles/create',
            BodyValidator(articleCreateSchema),
            this._putArticle,
        )
        router.post('/articles/refresh/:id', this._refreshNotionNotionBlocks)
        router.put(
            '/articles/:id',
            BodyValidator(articleUpdateSchema),
            this._updateArticle,
        )
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
            blocks,
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
            blocks,
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
}
