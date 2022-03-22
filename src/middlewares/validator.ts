import { Schema, Validator } from 'jsonschema'
import { errorBuilder } from '../common/errors'
import { errorResponse } from '../common/responses'

const validator = new Validator()

export const BodyValidator = (schema: Schema) => {
    return async (req: Request) => {
        const body = await req.clone().json()
        if (!validator.validate(body, schema).valid)
            return errorResponse(errorBuilder(400, 'Invalid body'))
    }
}
