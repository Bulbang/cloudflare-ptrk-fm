import { Env } from '../types/declarations/cfServices'
import { errorBuilder } from './response/errors'
import { errorResponse } from './response/responses'

export const resize = async (options: {
    width: string
    height: string
    imgBlob: Blob
    req: Request
    env: Env
}) => {
    const { width, height, imgBlob, req, env } = options
    if (+width < 1 || +height < 1) {
        return errorResponse(errorBuilder(400, 'Incorrect size'))
    }
    const formData = new FormData()
    formData.append('image', imgBlob)
    formData.append('width', width)
    formData.append('height', height)
    const reqToResize = new Request(req, { body: formData, method: 'POST' })
    const response = await env.RESIZER.fetch(reqToResize)
    if (response.status > 399) {
        return response
    }
    const arrayBuffer = await response.arrayBuffer()

    return new Response(arrayBuffer, {
        headers: { 'Content-Type': 'image/jpeg' },
    })
}
