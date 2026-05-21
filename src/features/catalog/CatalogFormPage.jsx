import { useState, useEffect, useRef } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import {
  useGetPostByIdQuery,
  useCreatePostMutation,
  useUpdatePostMutation,
} from './catalogApi'
import styles from './CatalogFormPage.module.css'

export function CatalogFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [errors, setErrors] = useState({})
  const [success, setSuccess] = useState(false)

  const { data: existing, isLoading: loadingExisting } = useGetPostByIdQuery(
    Number(id),
    { skip: !isEdit }
  )
  const [createPost, { isLoading: isCreating }] = useCreatePostMutation()
  const [updatePost, { isLoading: isUpdating }] = useUpdatePostMutation()

  const isSaving = isCreating || isUpdating
  const navTimerRef = useRef(null)

  useEffect(() => {
    function prefill() {
      if (existing) {
        setTitle(existing.title)
        setBody(existing.body)
      }
    }
    prefill()
  }, [existing])

  useEffect(() => {
    if (!success) return
    navTimerRef.current = setTimeout(() => navigate('/catalog'), 1200)
    return () => clearTimeout(navTimerRef.current)
  }, [success, navigate])

  function validate() {
    const errs = {}
    if (!title.trim()) errs.title = 'กรุณากรอกชื่อ (title)'
    if (title.trim().length < 3) errs.title = 'ชื่อต้องมีอย่างน้อย 3 ตัวอักษร'
    if (!body.trim()) errs.body = 'กรุณากรอกรายละเอียด (body)'
    return errs
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) {
      setErrors(errs)
      return
    }
    setErrors({})

    const payload = { title: title.trim(), body: body.trim(), userId: 1 }

    if (isEdit) {
      await updatePost({ id: Number(id), ...payload })
    } else {
      await createPost(payload)
      setTitle('')
      setBody('')
    }

    setSuccess(true)
  }

  if (isEdit && loadingExisting) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.loadingBox}>
            <span className={styles.spinner} />
            <span className={styles.loadingText}>กำลังโหลดข้อมูล…</span>
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
          <h1 className={styles.heading}>
            {isEdit ? `แก้ไข Post #${id}` : 'สร้างรายการใหม่'}
          </h1>

          {success && (
            <div className={styles.successBanner}>
              ✓ {isEdit ? 'บันทึกการแก้ไขแล้ว' : 'สร้างรายการใหม่แล้ว'} — กำลังกลับรายการ…
            </div>
          )}

          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <div className={styles.fieldGroup}>
              <label htmlFor="cat-title" className={styles.label}>
                Title <span className={styles.required}>*</span>
              </label>
              <input
                id="cat-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={`${styles.input} ${errors.title ? styles.inputError : ''}`}
                placeholder="ชื่อรายการ"
                disabled={isSaving}
              />
              {errors.title && (
                <span className={styles.fieldError}>{errors.title}</span>
              )}
            </div>

            <div className={styles.fieldGroup}>
              <label htmlFor="cat-body" className={styles.label}>
                Body <span className={styles.required}>*</span>
              </label>
              <textarea
                id="cat-body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className={`${styles.textarea} ${errors.body ? styles.inputError : ''}`}
                placeholder="รายละเอียด"
                disabled={isSaving}
              />
              {errors.body && (
                <span className={styles.fieldError}>{errors.body}</span>
              )}
            </div>

            <div className={styles.formActions}>
              <button
                type="submit"
                className={`${styles.btn} ${styles.btnSubmit}`}
                disabled={isSaving}
              >
                {isSaving ? 'กำลังบันทึก…' : isEdit ? 'บันทึกการแก้ไข' : 'สร้างรายการ'}
              </button>
              <Link to="/catalog" className={`${styles.btn} ${styles.btnCancel}`}>
                ยกเลิก
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
