import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useGetPostsQuery, useDeletePostMutation } from './catalogApi'
import { selectFilteredPosts, selectPostCount } from './catalogSelectors'
import { CatalogRow } from './CatalogRow'
import styles from './CatalogListPage.module.css'

export function CatalogListPage() {
  const [query, setQuery] = useState('')
  const { isLoading, isError, error } = useGetPostsQuery()
  const posts = useSelector((state) => selectFilteredPosts(state, query))
  const total = useSelector(selectPostCount)
  const [deletePost, { isLoading: isDeleting }] = useDeletePostMutation()

  async function handleDelete(id) {
    if (!window.confirm('ลบรายการนี้?')) return
    await deletePost(id)
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>

        <div className={styles.header}>
          <div className={styles.titleGroup}>
            <h1 className={styles.title}>Catalog</h1>
            <span className={styles.subtitle}>Mock REST API Demo — JSONPlaceholder</span>
          </div>
          <div className={styles.actions}>
            <Link to="/catalog/new" className={styles.newBtn}>+ สร้างใหม่</Link>
          </div>
        </div>

        <div className={styles.searchBar}>
          <input
            type="search"
            className={styles.searchInput}
            placeholder="ค้นหา title หรือ body…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className={styles.divider} />

        {isLoading && (
          <div className={styles.loadingBox}>
            <span className={styles.spinner} />
            <span className={styles.loadingText}>กำลังโหลด…</span>
          </div>
        )}

        {isError && (
          <div className={styles.error}>
            <span className={styles.errorLabel}>เกิดข้อผิดพลาด</span>
            {error?.status} — ไม่สามารถดึงข้อมูลได้ กรุณาตรวจสอบ VITE_API_URL
          </div>
        )}

        {!isLoading && !isError && (
          <>
            <p className={styles.count}>
              แสดง {posts.length} / {total} รายการ
            </p>
            {posts.length === 0 ? (
              <div className={styles.empty}>ไม่พบรายการที่ตรงกับการค้นหา</div>
            ) : (
              <div className={styles.list}>
                {posts.map((post) => (
                  <CatalogRow
                    key={post.id}
                    post={post}
                    onDelete={handleDelete}
                    isDeleting={isDeleting}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
