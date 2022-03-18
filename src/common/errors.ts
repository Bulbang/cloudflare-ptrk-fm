import { HttpError } from '../types/error'

const statusCodesMap: { [code: number]: string } = {
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    500: 'Internal Server Error',
}

export const errorBuilder = (status: number, message: string): HttpError => {
    return {
        message,
        status,
        statusText: statusCodesMap[status],
    }
}
