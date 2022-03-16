import { unauthorized } from "../common/errors";
import { errorResponse } from "../common/responses";
import { Buffer } from "buffer";

export const authorizer = (req: Request) => {
    const authToken = req.headers.get("Authorization")
    
    if (!authToken) {
        return errorResponse(unauthorized("Error: Invalid token")) 
    }
    const encodedAuthData = Buffer.from(authToken.split(' ')[1], 'base64');
    const [login, password] = encodedAuthData.toString('utf-8').split(':');

    if (login !== LOGIN || password !== PASSWORD) {
        return errorResponse(unauthorized("Unauthorized"))
    } 
}