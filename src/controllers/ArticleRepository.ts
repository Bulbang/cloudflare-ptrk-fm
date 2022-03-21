import CyrillicToTranslit = require('cyrillic-to-translit-js')
import { v4 } from 'uuid'

import { errorBuilder } from '../common/errors'
import { Article, ArticleReqBody, TrimmedArticle } from '../types/article'

export class ArticleRepository {

    private createArticleObj(obj: any): Article {
        const article: Article = {
            id: obj.id,
            slug: obj.slug,
            title: obj.title,
            meta_title: obj.meta_title,
            meta_description: obj.meta_description,
            content: obj.content,
            created_at: obj.created_at,
            updated_at: obj.updated_at,
            file_id: obj.file_id,
            url: obj.url,
        }
        return article
    }

    public async getMany(): Promise<TrimmedArticle[]> {
        let list: Article[]
        try {
            const { keys } = await ARTICLES.list()
            list = await Promise.all(
                keys.map(async (key) =>
                    JSON.parse(await ARTICLES.get(key.name)),
                ),
            )
        } catch (error) {
            throw errorBuilder(500, 'KV find error')
        }

        if (!list) throw errorBuilder(404, 'Items not found')

        const articles: TrimmedArticle[] = list.map((item: Article) => {
            const { id, slug, title, url } = item
            return {
                id,
                slug,
                title,
                url,
            }
        })
        return articles
    }

    public async getById(id: string): Promise<Article> {
        let article: Article
        try {
            article = JSON.parse(await ARTICLES.get(id))
        } catch (error) {
            throw errorBuilder(500, 'KV get operation error')
        }

        if (!article) throw errorBuilder(404, `Item by id:${id} not found`)

        const formattedArticle: Article = this.createArticleObj(article)
        return formattedArticle
    }

    public async putData(
        article: ArticleReqBody & { url: string },
    ): Promise<Article> {
        try {
            const newArticle: Article = {
                id: v4(),
                slug: new CyrillicToTranslit().transform(
                    article.title.toLowerCase(),
                    '_',
                ),
                ...article,
                created_at: +new Date(),
                updated_at: +new Date(),
            }
            await ARTICLES.put(newArticle.id, JSON.stringify(newArticle))
            return newArticle
        } catch (error) {
            console.log(error)
            throw errorBuilder(500, 'KV put operation error')
        }
    }

    public async updateData(
        id: string,
        updateValues: Partial<ArticleReqBody>,
    ): Promise<Article> {
        let article: Article
        try {
            article = await this.getById(id)
        } catch (error) {
            throw error
        }

        for (const [key, val] of Object.entries(updateValues))
            article[key] = val
        article['updated_at'] = +new Date()

        try {
            await ARTICLES.delete(id)
        } catch (error) {
            throw errorBuilder(500, 'KV delete operation error')
        }
        try {
            await ARTICLES.put(article.id, JSON.stringify(article))
        } catch (error) {
            throw errorBuilder(500, 'KV put operation error')
        }

        return article
    }
}
