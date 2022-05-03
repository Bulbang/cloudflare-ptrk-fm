import { z } from 'zod'

export const articleCreateSchema = z
    .object({
        title: z.string(),
        meta_title: z.string(),
        meta_description: z.string(),
        file_id: z.string(),
        notion_url: z.string(),
        notion_blocks: z.object({
            props: z.any()
        }),
        slug: z.string(),
    })
    .strict()
