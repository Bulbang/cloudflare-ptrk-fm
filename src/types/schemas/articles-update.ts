export const articleUpdateSchema = {
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
    },
    additionalProperties: false,
}
