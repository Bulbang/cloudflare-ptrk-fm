import { HttpError } from '../../types/error'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    Vary: 'Origin',
}

export const okResponse = <TBody>(
    body?: TBody,
    headers?: { [header: string]: string },
): Response => {
    const options = {
        status: 200,
        statusText: 'OK',
        headers: { ...corsHeaders, ...headers },
    }

    return new Response(body ? JSON.stringify(body) : 'ok', options)
}
okResponse

export const errorResponse = (error: HttpError): Response => {
    const { message, status, statusText } = error
    return message && status && statusText
        ? new Response(message, {
              status,
              statusText,
              headers: corsHeaders,
          })
        : new Response('Internal server error', {
              status: 500,
              statusText: 'Internal',
              headers: corsHeaders,
          })
}
