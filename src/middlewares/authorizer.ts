import { errorBuilder } from '../utils/response/errors'
import { errorResponse } from '../utils/response/responses'

export const authorizer = (req: Request) => {
    const authToken = req.headers.get('Authorization')

    if (!authToken) {
        return errorResponse(errorBuilder(401, 'Error: Invalid token'))
    }
    const encodedAuthData = atob(authToken.split(' ')[1])
    const [login, password] = encodedAuthData.split(':')

    if (login !== LOGIN || password !== PASSWORD) {
        return errorResponse(errorBuilder(401, 'Unauthorized'))
    }
}
