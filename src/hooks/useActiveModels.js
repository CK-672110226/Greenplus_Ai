// Loads currently active models from Supabase model_deployments → model_files
// and dispatches them into aiConfigSlice so ScanPage picks them up automatically.

import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { supabase } from '../lib/supabase'
import { setAiConfig } from '../store/aiConfigSlice'

export function useActiveModels() {
  const dispatch = useDispatch()

  useEffect(() => {
    async function load() {
      try {
        const { data, error } = await supabase
          .from('model_deployments')
          .select('stage, material_type, model_files(model_url, metadata_url, class_labels, format, version_tag)')
          .eq('is_active', true)

        if (error || !data?.length) return

        let tmStage1Url       = ''
        let stage1ClassLabels = []
        const tmStage2Urls    = {}

        for (const row of data) {
          const mf = row.model_files
          if (!mf?.model_url) continue

          if (row.stage === 1) {
            tmStage1Url       = mf.model_url
            stage1ClassLabels = mf.class_labels ?? []
          } else if (row.stage === 2 && row.material_type) {
            tmStage2Urls[row.material_type] = mf.model_url
          }
        }

        // Determine the latest version tag for display
        const stage1Row   = data.find(r => r.stage === 1)
        const modelVersion = stage1Row?.model_files?.version_tag ?? 'v0-mock'

        dispatch(setAiConfig({ tmStage1Url, stage1ClassLabels, tmStage2Urls, modelVersion }))
      } catch {
        // Supabase not configured or table not yet migrated — stay on mock mode
      }
    }

    load()
  }, [dispatch])
}
