import { Schema, Validator } from 'jsonschema'
import { errorBuilder } from '../utils/response/errors'
import { errorResponse } from '../utils/response/responses'

const validator = new Validator()

export const BodyValidator = (schema: Schema) => {
    return async (req: Request) => {
        const body = await req.clone().json()
        if (!validator.validate(body, schema).valid)
            return errorResponse(errorBuilder(400, 'Invalid body'))
    }
}
