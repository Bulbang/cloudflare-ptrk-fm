import { errorBuilder } from '../common/errors'
import { errorResponse } from '../common/responses'

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
