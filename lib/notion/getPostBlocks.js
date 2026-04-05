import BLOG from '@/blog.config'
import { NotionAPI } from 'notion-client'

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export async function getPostBlocks (id) {
  const authToken = BLOG.notionAccessToken || null
  const api = new NotionAPI({ authToken })
  let retries = 0
  while (retries < 3) {
    try {
      const pageBlock = await api.getPage(id)
      return pageBlock
    } catch (err) {
      if (err.status === 429 && retries < 3) {
        console.warn(`Notion 429 error, retrying in ${Math.pow(2, retries)}s...`)
        await sleep(Math.pow(2, retries) * 1000)
        retries++
        continue
      }
      throw err
    }
  }
}
