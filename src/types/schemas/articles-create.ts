import { z } from 'zod'

export const articleCreateSchema = z
    .object({
        title: z.string(),
        meta_title: z.string(),
        meta_description: z.string(),
        file_id: z.string(),
        notion_url: z.string().url().nullable(),
        blocks: z.object({}),
        slug: z.string(),
    })
    .strict()
