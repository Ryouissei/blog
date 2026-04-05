import BLOG from '@/blog.config'
import { NotionAPI } from 'notion-client'

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export async function getPostBlocks (id) {
  const authToken = BLOG.notionAccessToken || null
  const api = new NotionAPI({ authToken })
  const maxRetries = 10
  let retries = 0
  while (retries < maxRetries) {
    try {
      const pageBlock = await api.getPage(id)
      return pageBlock
    } catch (err) {
      if (err.status === 429 && retries < maxRetries) {
        const delay = Math.pow(2, retries) * 2500 + Math.random() * 1000
        console.warn(`Notion error 429, retrying in ${Math.round(delay / 1000)}s... (${retries + 1}/${maxRetries})`)
        await sleep(delay)
        retries++
        continue
      }
      throw err
    }
  }
  return null
}
