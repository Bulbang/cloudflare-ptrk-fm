import { HttpError } from '../types/error'

export const okResponse = <TBody>(
    body: TBody,
    opt?: ResponseInit,
): Response => {
    opt.status = opt.status || 200
    opt.statusText = opt.statusText || 'OK'
    opt.headers = { ...opt.headers, 'Access-Control-Allow-Origin': '*' }

    return new Response(body ? JSON.stringify(body) : 'ok', opt)
}

export const errorResponse = (error: HttpError) => {
    const { message, status, statusText } = error
    return message && status && statusText
        ? new Response(message, {
              status,
              statusText,
              headers: { 'Access-Control-Allow-Origin': '*' },
          })
        : new Response('Internal server error', {
              status: 500,
              statusText: 'Internal',
              headers: { 'Access-Control-Allow-Origin': '*' },
          })
}
