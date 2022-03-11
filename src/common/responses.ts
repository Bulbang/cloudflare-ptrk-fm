import { Boom } from '@hapi/boom'

export const okResponse = <TBody>(body: TBody, opt: ResponseInit): Response => {
    return new Response(JSON.stringify(body), opt)
}

export const errorResponse = (error: Boom) => {
    return new Response(error.message, {
        status: error.output.payload.statusCode,
        statusText: error.output.payload.error,
    })
    //  new Response(error.message, {
    //       status: error.output.statusCode,
    //       statusText: error.output.error,
    //   })
}
