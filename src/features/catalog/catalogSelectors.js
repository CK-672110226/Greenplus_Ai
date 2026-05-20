import { createSelector } from '@reduxjs/toolkit'
import { catalogApi } from './catalogApi'

const selectPostsResult = catalogApi.endpoints.getPosts.select()

const selectAllPosts = createSelector(
  selectPostsResult,
  (result) => result?.data ?? []
)

export const selectFilteredPosts = createSelector(
  selectAllPosts,
  (_, query) => (query ?? '').toLowerCase().trim(),
  (posts, query) => {
    if (!query) return posts
    return posts.filter(
      (p) =>
        p.title.toLowerCase().includes(query) ||
        p.body.toLowerCase().includes(query)
    )
  }
)

export const selectPostCount = createSelector(
  selectAllPosts,
  (posts) => posts.length
)
