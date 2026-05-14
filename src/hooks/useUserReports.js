// For admin: fetch all pending user reports
// Returns { reports, loading, approveReport(id, trainingLabel), rejectReport(id, note) }

import { useState, useEffect, useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { supabase } from '../lib/supabase'
import { addNotification } from '../store/notificationSlice'

export function useUserReports() {
  const dispatch              = useDispatch()
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetch() {
      try {
        const { data, error } = await supabase
          .from('user_reports')
          .select('*')
          .eq('status', 'pending')
          .order('created_at', { ascending: false })

        if (!error && data) {
          setReports(data)
        }
      } catch {
        // fail silently
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  const approveReport = useCallback(async (id, trainingLabel) => {
    try {
      const report = reports.find(r => r.id === id)
      const { error } = await supabase
        .from('user_reports')
        .update({ status: 'approved' })
        .eq('id', id)

      if (!error) {
        setReports(prev => prev.filter(r => r.id !== id))

        if (report?.scan_image_url) {
          await supabase.from('training_images').insert({
            material_type: trainingLabel,
            stage:         1,
            label:         trainingLabel,
            storage_path:  report.scan_image_url,
            image_url:     report.scan_image_url,
            source:        'user_report',
          })
        }

        dispatch(addNotification({
          id:      Date.now(),
          message: `Report approved: ${trainingLabel}`,
          type:    'success',
          at:      new Date().toISOString(),
        }))
      }
    } catch {
      // fail silently
    }
  }, [reports, dispatch])

  const rejectReport = useCallback(async (id, note) => {
    try {
      const { error } = await supabase
        .from('user_reports')
        .update({ status: 'rejected', admin_note: note ?? '' })
        .eq('id', id)

      if (!error) {
        setReports(prev => prev.filter(r => r.id !== id))
      }
    } catch {
      // fail silently
    }
  }, [])

  return { reports, loading, approveReport, rejectReport }
}
