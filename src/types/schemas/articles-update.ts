import { z } from 'zod'

// export const articleUpdateSchema: Schema = {
//     $schema: 'http://json-schema.org/draft-04/schema#',
//     type: 'object',
//     properties: {
//         title: {
//             type: 'string',
//         },
//         meta_title: {
//             type: 'string',
//         },
//         meta_description: {
//             type: 'string',
//         },

//         notion_url: {
//             type: 'string',
//         },
//     },
//     additionalProperties: false,
// }

export const articleUpdateSchema = z
    .object({
        title: z.string(),
        meta_title: z.string(),
        meta_description: z.string(),
        notion_url: z.string(),
    })
    .partial()
    .strict()
