import { Validator } from "jsonschema"
import { errorBuilder } from "../common/errors"
import { errorResponse } from "../common/responses"

export const BodyValidator= (schema: object) => {
    return async (req : Request) => {
        const validator = new Validator()
        const body = await req.clone().json()
        if (!validator.validate(body, schema).valid) return errorResponse(errorBuilder(400, "Invalid body"))
    }
}