import { errorBuilder } from './response/errors'
import parsePageId from './parse-page-id'



export const getNotionBlocks = async (url: string) => {
    const path = new URL(url).pathname
    const [pageId] = path.split('-').reverse()
    const id = parsePageId(pageId.replace(/\/+/g, ''))
    try {
        const data = await fetch(
            `https://notion-api.splitbee.io/v1/page/${id}`
          ).then(res => res.json());
        
          return {
            props: {
              blockMap: data
            }
          };
    } catch (error) {
        console.log(error)
        throw errorBuilder(500, 'Request to Notion failed')
    }

    
}
