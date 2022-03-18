import S3 = require('aws-sdk/clients/s3')
import { v4 } from 'uuid'

import { errorResponse, okResponse } from '../common/responses'
import { Article, ArticleReqBody, TrimmedArticle } from '../types/article'
import { ArticleRepository } from './ArticleRepository'

export class RouteController {
    async getArticles(req: Request) {
        const articleRepository = new ArticleRepository()
        try {
            const articles = await articleRepository.getMany()
            return okResponse<TrimmedArticle[]>(articles)
        } catch (error) {
            return errorResponse(error)
        }
    }

    async getArticle(req: Request & { params: { id: string } }) {
        const articleRepository = new ArticleRepository()
        try {
            const article = await articleRepository.getById(req.params.id)
            return okResponse<Article>(article)
        } catch (error) {
            return errorResponse(error)
        }
    }

    async putArticle(req: Request) {
        const articleRepository = new ArticleRepository()

        const body = await req.json<ArticleReqBody>()
        const { content, title, meta_description, meta_title, file_id } = body

        const url = `https://${BUCKET_NAME}.s3.amazonaws.com/${file_id}`
        const article = {
            title,
            meta_title,
            meta_description,
            content,
            url,
            file_id,
        }
        try {
            const newArticle = await articleRepository.putData(article)
            return okResponse<Article>(newArticle)
        } catch (error) {
            return errorResponse(error)
        }
    }

    async updateArticle(req: Request & { params: { id: string } }) {
        const idOfArticleToUpdate = req.params.id
        const dataToUpdate = await req.json<Omit<ArticleReqBody, 'url'>>()

        const articleRepository = new ArticleRepository()

        const res = await articleRepository.updateData(
            idOfArticleToUpdate,
            dataToUpdate,
        )
        return okResponse(res)
    }

    async createPresignPost(req: Request) {
        const s3 = new S3({
            accessKeyId: S3_ACCESS_KEY_ID,
            secretAccessKey: S3_SECRET_KEY,
        })

        const url = new URL(req.url)
        const fileName = url.searchParams.has('fileId')
            ? url.searchParams.get('fileId')
            : v4()

        const res = s3.createPresignedPost({
            Bucket: BUCKET_NAME,
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
