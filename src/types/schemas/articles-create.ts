export const articlesCreateSchema = {
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

        file_id: {
            type: 'string',
        },
    },
    required: ['title', 'meta_title', 'meta_description', 'content', 'file_id'],
}
