import { Client } from '@notionhq/client'
import { NotionToMarkdown } from 'notion-to-md'
import { MdBlock } from 'notion-to-md/build/types'
import { errorBuilder } from './response/errors'
import parsePageId from './parse-page-id'

const notionClient = new Client({ auth: NOTION_INTEGRATION_TOKEN })
const notionDataController = new NotionToMarkdown({ notionClient })

export const notionToMarkdown = async (url: string) => {
    const path = new URL(url).pathname
    const [pageId] = path.split('-').reverse()

    const _id = parsePageId(pageId.replace(/\/+/g, ''))
    let mdBlocks: MdBlock[]
    try {
        mdBlocks = await notionDataController.pageToMarkdown(_id)
    } catch (error) {
        console.log(error)
        throw errorBuilder(500, 'Notion request failed')
    }
    if (!mdBlocks.length) throw errorBuilder(404, 'Notion page not found')
    return notionDataController.toMarkdownString(mdBlocks)
}
