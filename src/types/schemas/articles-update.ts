import { z } from 'zod'

export const articleUpdateSchema = z
    .object({
        title: z.string(),
        meta_title: z.string(),
        meta_description: z.string(),
        notion_url: z.string(),
        blocks: z.any(),
    })
    .partial()
    .strict()
