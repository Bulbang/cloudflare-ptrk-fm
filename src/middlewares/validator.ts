import { Schema, Validator } from '@cfworker/json-schema'
import { errorBuilder } from '../utils/response/errors'
import { errorResponse } from '../utils/response/responses'

export const BodyValidator = (schema: Schema) => {
    const validator = new Validator(schema)
    return async (req: Request) => {
        const body = await req.clone().json()
        if (!validator.validate(body).valid)
            return errorResponse(errorBuilder(400, 'Invalid body'))
    }
}
