import { errorBuilder } from './response/errors'
import parsePageId from './parse-page-id'
import { PageDataResponse } from '../types/notion/notion'
import { BlockValueType } from '../types/notion/block'

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms))

export const getNotionBlocks = async (url: string) => {
    const path = new URL(url).pathname
    const [pageId] = path.split('-').reverse()
    const id = parsePageId(pageId.replace(/\/+/g, ''))
    console.log(path, id, pageId)
    await fetchNotionBlocks(id)
    delay(300)
    const { recordMap } = await fetchNotionBlocks(id)
    let blockMap: { [key: string]: BlockValueType } = {}
    for (const key in recordMap.block) {
        blockMap[key] = recordMap.block[key].value
    }
    return {
        props: {
            blockMap,
        },
    }
}

const fetchNotionBlocks = async (id: string) => {
    const data = await fetch(
        'https://www.notion.so/api/v3/loadCachedPageChunk',
        {
            headers: {
                Accept: '*/*',
                'Accept-Language': 'en-US,en;q=0.5',
                'notion-client-version': '23.10.25.0',
                'notion-audit-log-platform': 'web',
                'x-notion-active-user-header':
                    '221cb0fe-671e-4537-b4f3-07e8af785f50',
                'Content-Type': 'application/json',
                'Sec-Fetch-Dest': 'empty',
                'Sec-Fetch-Mode': 'no-cors',
                'Sec-Fetch-Site': 'same-origin',
                Pragma: 'no-cache',
                'Cache-Control': 'no-cache',
            },
            body: JSON.stringify({
                page: { id },
                limit: 100,
                cursor: { stack: [] },
                chunkNumber: 0,
                verticalColumns: false,
            }),
            method: 'POST',
        },
    ).then((response) => {
        if (response.ok) {
            return response.json<PageDataResponse>()
        }
        switch (response.status) {
            case 400:
                throw errorBuilder(response.status, 'Invalid input')

            default:
                throw errorBuilder(500, 'Request to Notion failed')
        }
    })
    const { cursor } = data
    while (cursor.stack.length) {
        const restPageData = await fetch(
            'https://www.notion.so/api/v3/loadCachedPageChunk',
            {
                headers: {
                    Accept: '*/*',
                    'Accept-Language': 'en-US,en;q=0.5',
                    'notion-client-version': '23.10.25.0',
                    'notion-audit-log-platform': 'web',
                    'x-notion-active-user-header':
                        '221cb0fe-671e-4537-b4f3-07e8af785f50',
                    'Content-Type': 'application/json',
                    'Sec-Fetch-Dest': 'empty',
                    'Sec-Fetch-Mode': 'no-cors',
                    'Sec-Fetch-Site': 'same-origin',
                    Pragma: 'no-cache',
                    'Cache-Control': 'no-cache',
                },
                body: JSON.stringify({
                    page: { id },
                    limit: 100,
                    cursor,
                    chunkNumber: 0,
                    verticalColumns: false,
                }),
                method: 'POST',
            },
        ).then((response) => {
            if (response.ok) {
                return response.json<PageDataResponse>()
            }
            switch (response.status) {
                case 400:
                    errorBuilder(response.status, 'Invalid input')
                    break

                default:
                    throw errorBuilder(500, 'Request to Notion failed')
            }
        })
        cursor.stack = restPageData.cursor.stack
        Object.keys(restPageData.recordMap.block).forEach((key) => {
            data.recordMap.block[key] = restPageData.recordMap.block[key]
        })
    }
    return data
}
