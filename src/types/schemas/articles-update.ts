import { Schema } from '@cfworker/json-schema'

export const articleUpdateSchema: Schema = {
    $schema: 'http://json-schema.org/draft-04/schema#',
    type: 'object',
    properties: {
        title: {
            type: 'string',
        },
        meta_title: {
            type: 'string',
        },
        meta_description: {
            type: 'string',
        },
        content: {
            type: 'string',
        },
        notion_url: {
            type: 'string',
        },
    },
    additionalProperties: false,
}
