import { S3 } from '@aws-sdk/client-s3'
import { createPresignedPost } from '@aws-sdk/s3-presigned-post'
import { v4 } from 'uuid'

import { errorResponse, okResponse } from '../utils/response/responses'
import { Article, ArticleReqBody, TrimmedArticle } from '../types/article'
import { ArticleRepository } from '../repositories/ArticleRepository'
import { Router } from 'itty-router'
import { authorizer } from '../middlewares/authorizer'
import { BodyValidator } from '../middlewares/validator'
import { articleCreateSchema } from '../types/schemas/articles-create'
import { articleUpdateSchema } from '../types/schemas/articles-update'
import { errorBuilder } from '../utils/response/errors'
import { isLatinWithoutWhitespace, toTranslit } from '../utils/slugUtils'

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
        this._router.get('/articles', this._getArticles)
        this._router.get('/articles/:id', this._getArticle)
        this._router.post(
            '/articles/create',
            authorizer,
            BodyValidator(articleCreateSchema),
            this._putArticle,
        )
        this._router.post(
            '/articles/refresh/:id',
            authorizer,
            this._refreshNotionMarkdown,
        )
        this._router.put(
            '/articles/:id',
            authorizer,
            BodyValidator(articleUpdateSchema),
            this._updateArticle,
        )
        this._router.get('/transliterate', authorizer, this._generateSlug)
        this._router.get('/getPresignUrl', authorizer, this._createPresignPost)
        this._router.all('/*', () =>
            errorResponse(errorBuilder(404, 'Not found')),
        )
    }

    private _getArticles = async (): Promise<Response> => {
        try {
            const articles = await this._articleRepository.getMany()
            return okResponse<TrimmedArticle[]>(articles)
        } catch (error) {
            return errorResponse(error)
        }
    }

    private _getArticle = async (
        req: Request & { params: { id: string } },
    ): Promise<Response> => {
        try {
            const article = await this._articleRepository.getById(req.params.id)
            return okResponse<Article>(article)
        } catch (error) {
            console.log(error)
            return errorResponse(error)
        }
    }

    private _putArticle = async (req: Request): Promise<Response> => {
        const body = await req.json<ArticleReqBody>()
        const {
            title,
            meta_description,
            meta_title,
            file_id,
            notion_url,
            slug,
        } = body

        if (!isLatinWithoutWhitespace(slug.toLowerCase()))
            return errorResponse(errorBuilder(400, 'Invalid slug'))

        const url = `https://${BUCKET_NAME}.s3.amazonaws.com/${file_id}`
        const article = {
            title,
            meta_title,
            meta_description,
            url,
            file_id,
            notion_url,
            slug: slug.toLowerCase(),
        }
        try {
            const newArticle = await this._articleRepository.putData(article)
            return okResponse(newArticle)
        } catch (error) {
            return errorResponse(error)
        }
    }

    private _updateArticle = async (
        req: Request & { params: { id: string } },
    ): Promise<Response> => {
        try {
            const idOfArticleToUpdate = req.params.id
            const dataToUpdate = await req.json<Omit<ArticleReqBody, 'url'>>()
            const res = await this._articleRepository.updateData(
                idOfArticleToUpdate,
                dataToUpdate,
            )
            return okResponse(res)
        } catch (error) {
            return errorResponse(error)
        }
    }

    private _createPresignPost = async (req: Request): Promise<Response> => {
        const s3 = new S3({
            credentials: {
                accessKeyId: AWS_ACCESS_KEY_ID,
                secretAccessKey: AWS_SECRET_KEY,
            },
            region: AWS_REGION,
        })

        const url = new URL(req.url)
        const fileName = url.searchParams.has('fileId')
            ? url.searchParams.get('fileId')
            : v4()

        const res = await createPresignedPost(s3, {
            Bucket: BUCKET_NAME,
            Key: fileName,
            Fields: {
                acl: 'public-read',
                key: fileName,
            },
            Conditions: [
                ['starts-with', '$Content-Type', 'image/'],
                ['content-length-range', 0, 10000000],
            ],
        })
        return okResponse(res)
    }
    private _generateSlug = async (req: Request) => {
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
    private _refreshNotionMarkdown = async (
        req: Request & { params: { id: string } },
    ) => {
        const { id } = req.params
        try {
            const refreshedArticle =
                await this._articleRepository.refreshMarkdown(id)
            return okResponse(refreshedArticle)
        } catch (error) {
            return errorResponse(error)
        }
    }
}
// refresh endpoint
// minus content
// generate slug
