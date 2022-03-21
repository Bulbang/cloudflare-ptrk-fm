import { HttpError } from '../types/error'

export const okResponse = <TBody>(
    body: TBody
): Response => {
    
    const options = {
        status : 200,
        statusText :'OK',
        headers : { 'Access-Control-Allow-Origin': '*' }
    }
    

    return new Response(body ? JSON.stringify(body) : 'ok', options)
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
