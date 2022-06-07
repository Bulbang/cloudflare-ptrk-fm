export type Article = {
    id: string
    slug: string
    title: string
    meta_title: string
    meta_description: string
    created_at: number
    updated_at: number
    file_id: string
    blocks: any
    notion_url?: string
}

export type ArticleReqBody = Omit<
    Article,
    'id' | 'created_at' | 'updated_at' | 'body'
>

export type TrimmedArticle = Omit<
    Article,
    | 'meta_title'
    | 'meta_description'
    | 'updated_at'
    | 'file_id'
    | 'body'
    | 'blocks'
    | 'notion_url'
>
