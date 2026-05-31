import BLOG from '@/blog.config'
import { NotionAPI } from 'notion-client'
import { idToUuid } from 'notion-utils'
import getAllPageIds from './getAllPageIds'
import getPageProperties from './getPageProperties'
import filterPublishedPosts from './filterPublishedPosts'

/**
 * @param {{ includePages: boolean }} - false: posts only / true: include pages
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))
const CACHE_TTL_MS = 60 * 1000
const postsCache = new Map()
const NOTION_VERSION = '2026-03-11'

function getPlainText (richText = []) {
  return richText.map(part => part?.plain_text || '').join('')
}

function mapNotionDate (date) {
  if (!date?.start) return undefined

  const mapped = {
    start_date: date.start.slice(0, 10)
  }

  if (date.end) mapped.end_date = date.end.slice(0, 10)
  return mapped
}

function mapPropertyValue (property) {
  if (!property) return undefined

  switch (property.type) {
    case 'title':
      return getPlainText(property.title)
    case 'rich_text':
      return getPlainText(property.rich_text)
    case 'select':
      return property.select?.name ? [property.select.name] : undefined
    case 'multi_select':
      return property.multi_select?.map(option => option.name) || []
    case 'status':
      return property.status?.name ? [property.status.name] : undefined
    case 'date':
      return mapNotionDate(property.date)
    case 'url':
      return property.url
    case 'email':
      return property.email
    case 'phone_number':
      return property.phone_number
    case 'checkbox':
      return property.checkbox
    case 'number':
      return property.number
    case 'people':
      return property.people || []
    default:
      return undefined
  }
}

function mapOfficialApiPage (page) {
  const properties = {
    id: page.id,
    createdTime: new Date(page.created_time).toString(),
    fullWidth: false
  }

  Object.entries(page.properties || {}).forEach(([name, property]) => {
    const value = mapPropertyValue(property)
    if (value !== undefined && value !== null) {
      properties[name] = value
    }
  })

  return properties
}

async function queryOfficialNotionDataSource () {
  const token = BLOG.notionApiToken
  const dataSourceId = BLOG.notionDataSourceId

  if (!token || !dataSourceId) return null

  const pages = []
  let startCursor

  do {
    const response = await fetch(
      `https://api.notion.com/v1/data_sources/${dataSourceId}/query`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Notion-Version': NOTION_VERSION
        },
        body: JSON.stringify({
          page_size: 100,
          start_cursor: startCursor
        })
      }
    )

    if (!response.ok) {
      const text = await response.text()
      throw new Error(`Notion data source query failed: ${response.status} ${text}`)
    }

    const data = await response.json()
    pages.push(...data.results)
    startCursor = data.has_more ? data.next_cursor : undefined
  } while (startCursor)

  return pages.map(mapOfficialApiPage)
}

export async function getAllPosts ({ includePages = false }) {
  const cacheKey = includePages ? 'includePages:true' : 'includePages:false'
  const now = Date.now()
  const cached = postsCache.get(cacheKey)
  if (cached && now - cached.createdAt < CACHE_TTL_MS) {
    return cached.data
  }

  const officialPages = await queryOfficialNotionDataSource()
  if (officialPages) {
    const posts = filterPublishedPosts({ posts: officialPages, includePages })

    if (BLOG.sortByDate) {
      posts.sort((a, b) => {
        const dateA = new Date(a?.date?.start_date || a.createdTime)
        const dateB = new Date(b?.date?.start_date || b.createdTime)
        return dateB - dateA
      })
    }

    postsCache.set(cacheKey, {
      data: posts,
      createdAt: now
    })

    return posts
  }

  let id = BLOG.notionPageId
  const authToken = BLOG.notionAccessToken || null
  const api = new NotionAPI({ authToken })
  let response
  const maxRetries = 10
  let retries = 0
  while (retries < maxRetries) {
    try {
      response = await api.getPage(id)
      break
    } catch (err) {
      if ((err.status === 429 || err.status === 502) && retries < maxRetries) {
        const delay = Math.pow(2, retries) * 2500 + Math.random() * 1000
        console.warn(`Notion error ${err.status}, retrying in ${Math.round(delay / 1000)}s... (${retries + 1}/${maxRetries})`)
        await sleep(delay)
        retries++
        continue
      }
      throw err
    }
  }

  if (!response) {
    throw new Error(`Failed to fetch Notion page ${id} after ${retries} retries.`)
  }

  id = idToUuid(id)
  const collectionVal = Object.values(response.collection || {})[0]?.value
  const collection = collectionVal?.value || collectionVal
  const collectionQuery = response.collection_query
  const collectionView = response.collection_view
  const block = response.block
  const schema = collection?.schema

  const rawMetadata = block[id]?.value?.value || block[id]?.value

  // Check Type
  if (
    rawMetadata?.type !== 'collection_view_page' &&
    rawMetadata?.type !== 'collection_view'
  ) {
    console.log(`pageId "${id}" is not a database`)
    return null
  } else {
    // Construct Data
    const pageIds = getAllPageIds(collectionQuery, collection?.id, collectionView)
    const data = []
    for (let i = 0; i < pageIds.length; i++) {
      const id = pageIds[i]
      const properties = (await getPageProperties(id, block, schema)) || null

      // Add fullwidth, createdtime to properties
      const blockValue = block[id]?.value?.value || block[id]?.value
      properties.createdTime = new Date(
        blockValue?.created_time
      ).toString()
      properties.fullWidth = blockValue?.format?.page_full_width ?? false

      data.push(properties)
    }

    // remove all the the items doesn't meet requirements
    const posts = filterPublishedPosts({ posts: data, includePages })

    // Sort by date
    if (BLOG.sortByDate) {
      posts.sort((a, b) => {
        const dateA = new Date(a?.date?.start_date || a.createdTime)
        const dateB = new Date(b?.date?.start_date || b.createdTime)
        return dateB - dateA
      })
    }

    postsCache.set(cacheKey, {
      data: posts,
      createdAt: now
    })

    return posts
  }
}
