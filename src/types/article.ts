export type Article = {
    id: string
    slug: string
    title: string
    meta_title: string
    meta_description: string
    created_at: number
    updated_at: number
    file_id: string
    url: string
    markdown: string
    notion_url: string
}

export type ArticleReqBody = Omit<
    Article,
    'id' | 'created_at' | 'updated_at' | 'url' | 'body'
>

export type TrimmedArticle = Omit<
    Article,
    | 'meta_title'
    | 'meta_description'
    | 'created_at'
    | 'updated_at'
    | 'file_id'
    | 'body'
    | 'markdown'
    | 'notion_url'
>
