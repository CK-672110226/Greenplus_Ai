// For admin: fetch all pending user reports
// Returns { reports, loading, error, approveReport(id, trainingLabel), rejectReport(id, note) }

import { useState, useEffect, useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { supabase } from '../lib/supabase'
import { addNotification } from '../store/notificationSlice'

export function useUserReports() {
  const dispatch              = useDispatch()
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    async function fetch() {
      try {
        const { data, error: fetchErr } = await supabase
          .from('user_reports')
          .select('*')
          .eq('status', 'pending')
          .order('created_at', { ascending: false })

        if (fetchErr) throw fetchErr
        if (data) setReports(data)
      } catch (err) {
        setError(err?.message ?? 'โหลด reports ไม่สำเร็จ')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  const approveReport = useCallback(async (id, trainingLabel) => {
    const prev = reports.find(r => r.id === id)
    setReports(r => r.filter(x => x.id !== id))
    try {
      const { error: updateErr } = await supabase
        .from('user_reports')
        .update({ status: 'approved' })
        .eq('id', id)
      if (updateErr) throw updateErr

      if (prev?.scan_image_url) {
        await supabase.from('training_images').insert({
          material_type: trainingLabel,
          stage:         1,
          label:         trainingLabel,
          storage_path:  prev.scan_image_url,
          image_url:     prev.scan_image_url,
          source:        'user_report',
        })
      }

      dispatch(addNotification({
        id:        Date.now(),
        body:      `Report approved: ${trainingLabel}`,
        type:      'success',
        createdAt: new Date().toISOString(),
      }))
      return { ok: true }
    } catch (err) {
      if (prev) setReports(r => [prev, ...r])
      return { ok: false, error: err?.message ?? 'อนุมัติไม่สำเร็จ' }
    }
  }, [reports, dispatch])

  const rejectReport = useCallback(async (id, note) => {
    const prev = reports.find(r => r.id === id)
    setReports(r => r.filter(x => x.id !== id))
    try {
      const { error: updateErr } = await supabase
        .from('user_reports')
        .update({ status: 'rejected', admin_note: note ?? '' })
        .eq('id', id)
      if (updateErr) throw updateErr
      return { ok: true }
    } catch (err) {
      if (prev) setReports(r => [prev, ...r])
      return { ok: false, error: err?.message ?? 'ปฏิเสธไม่สำเร็จ' }
    }
  }, [reports])

  return { reports, loading, error, approveReport, rejectReport }
}
