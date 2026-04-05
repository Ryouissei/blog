import { idToUuid } from 'notion-utils'

export default function getAllPageIds (collectionQuery, collectionId, collectionView, viewId) {
  let pageIds = []

  if (collectionQuery && Object.keys(collectionQuery).length > 0) {
    const views = Object.values(collectionQuery)[0]
    if (views) {
      if (viewId) {
        const vId = idToUuid(viewId)
        pageIds = views[vId]?.blockIds || []
      } else {
        const pageSet = new Set()
        Object.values(views).forEach(view => {
          view?.blockIds?.forEach(id => pageSet.add(id))
        })
        pageIds = [...pageSet]
      }
      if (pageIds.length > 0) return pageIds
    }
  }

  if (collectionView && Object.keys(collectionView).length > 0) {
    if (viewId) {
      const vId = idToUuid(viewId)
      const view = collectionView[vId]?.value?.value || collectionView[vId]?.value
      pageIds = view?.page_sort || []
    } else {
      const pageSet = new Set()
      Object.values(collectionView).forEach(viewObj => {
        const view = viewObj?.value?.value || viewObj?.value
        view?.page_sort?.forEach(id => pageSet.add(id))
      })
      pageIds = [...pageSet]
    }
  }

  return pageIds
}
