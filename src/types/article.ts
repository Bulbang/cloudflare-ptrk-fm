export type Article = {
    id: string
    slug: string
    title: string
    meta_title: string
    meta_description: string
    content: string
    created_at: number
    updated_at: number
    file_id: string
    url: string
    markdown: string
}

export type ArticleReqBody = Omit<
    Article,
    'id' | 'slug' | 'created_at' | 'updated_at' | 'url' | 'body' | 'markdown'
> & { notion_url: string }

export type TrimmedArticle = Omit<
    Article,
    | 'meta_title'
    | 'meta_description'
    | 'content'
    | 'created_at'
    | 'updated_at'
    | 'file_id'
    | 'body'
    | 'markdown'
>
