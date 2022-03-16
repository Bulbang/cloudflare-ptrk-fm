import { HttpError } from "../types/error"

export const unauthorized = (message: string) => {
    const payload : HttpError = {
        message,
        status: 401,
        statusText: 'Unauthorized'
    }
    return payload
}