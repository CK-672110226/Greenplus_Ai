import { useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useGetPostByIdQuery, useDeletePostMutation } from './catalogApi'
import styles from './CatalogDetailPage.module.css'

export function CatalogDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: post, isLoading, isError, error } = useGetPostByIdQuery(Number(id))
  const [deletePost, { isLoading: isDeleting }] = useDeletePostMutation()
  const [confirmDelete, setConfirmDelete] = useState(false)

  async function handleDelete() {
    if (!confirmDelete) { setConfirmDelete(true); return }
    await deletePost(Number(id))
    navigate('/catalog')
  }

  if (isLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.loadingBox}>
            <span className={styles.spinner} />
            <span className={styles.loadingText}>กำลังโหลด…</span>
          </div>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <Link to="/catalog" className={styles.backLink}>← กลับ</Link>
          <div className={styles.error}>
            {error?.status} — ไม่พบรายการ #{id}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <Link to="/catalog" className={styles.backLink}>← กลับรายการ</Link>

        <div className={styles.card}>
          <span className={styles.idBadge}>POST #{post.id}</span>
          <h1 className={styles.title}>{post.title}</h1>
          <div className={styles.divider} />
          <p className={styles.bodyText}>{post.body}</p>

          <div className={styles.metaRow}>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>User ID</span>
              <span className={styles.metaValue}>{post.userId}</span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Post ID</span>
              <span className={styles.metaValue}>{post.id}</span>
            </div>
          </div>

          <div className={styles.actions}>
            <Link to="/catalog" className={`${styles.btn} ${styles.btnBack}`}>← กลับ</Link>
            <Link to={`/catalog/${post.id}/edit`} className={`${styles.btn} ${styles.btnEdit}`}>แก้ไข</Link>
            {confirmDelete ? (
              <>
                <button
                  className={`${styles.btn} ${styles.btnDelete}`}
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'กำลังลบ…' : 'ยืนยันลบ?'}
                </button>
                <button
                  className={`${styles.btn} ${styles.btnBack}`}
                  onClick={() => setConfirmDelete(false)}
                  disabled={isDeleting}
                >
                  ยกเลิก
                </button>
              </>
            ) : (
              <button
                className={`${styles.btn} ${styles.btnDelete}`}
                onClick={handleDelete}
              >
                ลบ
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
