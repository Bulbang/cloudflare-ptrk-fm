import { v4 } from 'uuid'

import { Article, ArticleReqBody, TrimmedArticle } from '../types/article'
import { getNotionBlocks } from '../utils/notion-utils'
import { errorBuilder } from '../utils/response/errors'

export class ArticleRepository {
    constructor() {}

    private createArticleObj(obj: any): Article {
        const article: Article = {
            id: obj.id,
            slug: obj.slug,
            title: obj.title,
            meta_title: obj.meta_title,
            meta_description: obj.meta_description,
            notion_blocks: obj.notion_blocks,
            created_at: obj.created_at,
            updated_at: obj.updated_at,
            file_id: obj.file_id,
            url: obj.url,
            notion_url: obj.notion_url,
        }
        return article
    }

    public getMany = async (options?: {
        sortByDate: string
    }): Promise<TrimmedArticle[]> => {
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
            const { id, slug, title, url, created_at } = item
            return {
                id,
                slug,
                title,
                created_at,
                url,
            }
        })

        if (options.sortByDate == 'descending') {
            articles.sort((a, b) => b.created_at - a.created_at)
        } else if (options.sortByDate == 'ascending') {
            articles.sort((a, b) => a.created_at - b.created_at)
        }

        return articles
    }

    public getById = async (id: string): Promise<Article> => {
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

    public putData = async (
        article: ArticleReqBody & { url: string },
    ): Promise<Article> => {
        const newArticle: Article = {
            id: v4(),
            ...article,
            created_at: +new Date(),
            updated_at: +new Date(),
        }

        try {
            await ARTICLES.put(newArticle.id, JSON.stringify(newArticle))
            return newArticle
        } catch (error) {
            console.log(error)
            throw errorBuilder(500, 'KV put operation error')
        }
    }

    public updateData = async (
        id: string,
        updateValues: Partial<ArticleReqBody>,
    ): Promise<Article> => {
        let article: Article
        try {
            article = await this.getById(id)
        } catch (error) {
            throw error
        }

        for (const [key, val] of Object.entries(updateValues)) {
            if (key === 'notion_url')
                article['notion_blocks'] = await getNotionBlocks(val as string)

            article[key] = val
        }
        article['updated_at'] = +new Date()

        try {
            await ARTICLES.put(article.id, JSON.stringify(article))
        } catch (error) {
            throw errorBuilder(500, 'KV put operation error')
        }

        return article
    }

    public refreshNotionBlocks = async (id: string) => {
        const article = await this.getById(id)
        article.notion_blocks = await getNotionBlocks(article.notion_url)
        try {
            console.log(article)
            await ARTICLES.put(article.id, JSON.stringify(article))
            return article
        } catch (error) {
            console.log(error)
            throw errorBuilder(500, 'KV put operation error')
        }
    }
}
