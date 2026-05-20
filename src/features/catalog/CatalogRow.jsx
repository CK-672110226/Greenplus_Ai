import { memo } from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import styles from './CatalogRow.module.css'

export const CatalogRow = memo(function CatalogRow({ post, onDelete, isDeleting }) {
  return (
    <div className={styles.row}>
      <span className={styles.id}>#{post.id}</span>
      <div className={styles.content}>
        <p className={styles.title}>{post.title}</p>
        <p className={styles.body}>{post.body}</p>
      </div>
      <div className={styles.controls}>
        <Link to={`/catalog/${post.id}`} className={styles.iconBtn} title="ดูรายละเอียด">
          ▶
        </Link>
        <Link to={`/catalog/${post.id}/edit`} className={styles.iconBtn} title="แก้ไข">
          ✎
        </Link>
        <button
          className={`${styles.iconBtn} ${styles.deleteBtn}`}
          onClick={() => onDelete(post.id)}
          disabled={isDeleting}
          title="ลบ"
        >
          ✕
        </button>
      </div>
    </div>
  )
})

CatalogRow.propTypes = {
  post:       PropTypes.shape({ id: PropTypes.number, title: PropTypes.string, body: PropTypes.string }).isRequired,
  onDelete:   PropTypes.func.isRequired,
  isDeleting: PropTypes.bool,
}
