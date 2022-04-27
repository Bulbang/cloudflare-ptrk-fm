import { ZodObject, ZodRawShape, ZodTypeAny } from 'zod'
import { errorBuilder } from '../utils/response/errors'
import { errorResponse } from '../utils/response/responses'

export const BodyValidator = <TSchema extends ZodRawShape>(
    schema: ZodObject<TSchema, 'strict', ZodTypeAny>,
) => {
    return async (req: Request) => {
        const body = await req.clone().json()
        const parseResult = schema.safeParse(body)
        if (!parseResult.success)
            return errorResponse(errorBuilder(400, 'Invalid body'))
    }
}
