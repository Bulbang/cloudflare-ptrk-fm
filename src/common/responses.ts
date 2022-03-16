import { HttpError } from '../types/error'

export const okResponse = <TBody>(
    body: TBody,
    opt?: ResponseInit,
): Response => {
    if (opt) {
        opt.status = opt.status || 200
        opt.statusText = opt.statusText || 'OK'
    }

    return new Response(JSON.stringify(body), opt)
}

export const errorResponse = (error: HttpError) => {
    const { message, status, statusText } = error
    return message && status && statusText
        ? new Response(message, {
              status,
              statusText,
          })
        : new Response('Internal server error', {
              status: 500,
              statusText: 'Internal',
          })
}
