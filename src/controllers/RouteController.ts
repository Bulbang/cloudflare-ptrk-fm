import { S3 } from '@aws-sdk/client-s3'
import { createPresignedPost } from '@aws-sdk/s3-presigned-post'
import { v4 } from 'uuid'

import { errorResponse, okResponse } from '../utils/response/responses'
import { Article, ArticleReqBody, TrimmedArticle } from '../types/article'
import { ArticleRepository } from '../repositories/ArticleRepository'
import { Router } from 'itty-router'
import { authorizer } from '../middlewares/authorizer'
import { BodyValidator } from '../middlewares/validator'
import { articlesCreateSchema } from '../types/schemas/articles-create'
import { articleUpdateSchema } from '../types/schemas/articles-update'

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
        this._router.get('/articles', this.getArticles)

        this._router.get('/articles/:id', this.getArticle)

        this._router.post(
            '/articles/create',
            authorizer,
            BodyValidator(articlesCreateSchema),
            this.putArticle,
        )

        this._router.put(
            '/articles/:id',
            authorizer,
            BodyValidator(articleUpdateSchema),
            this.updateArticle,
        )

        this._router.get('/getPresignUrl', authorizer, this.createPresignPost)
    }

    getArticles = async (): Promise<Response> => {
        try {
            const articles = await this._articleRepository.getMany()
            return okResponse<TrimmedArticle[]>(articles)
        } catch (error) {
            return errorResponse(error)
        }
    }

    getArticle = async (
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

    putArticle = async (req: Request): Promise<Response> => {
        const body = await req.json<ArticleReqBody>()
        const {
            content,
            title,
            meta_description,
            meta_title,
            file_id,
            notion_url,
        } = body

        const url = `https://${BUCKET_NAME}.s3.amazonaws.com/${file_id}`
        const article = {
            title,
            meta_title,
            meta_description,
            content,
            url,
            file_id,
            notion_url,
        }
        try {
            const newArticle = await this._articleRepository.putData(article)
            return okResponse(newArticle)
        } catch (error) {
            return errorResponse(error)
        }
    }

    updateArticle = async (
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

    createPresignPost = async (req: Request): Promise<Response> => {
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
}
