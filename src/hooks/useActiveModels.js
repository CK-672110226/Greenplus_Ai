// Loads active models from Supabase model_deployments → model_files
// Falls back to local public/model_ai/ models when Supabase has nothing.

import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { supabase } from '../lib/supabase'
import { setAiConfig } from '../store/aiConfigSlice'
import { LOCAL_STAGE1_URL, LOCAL_STAGE1_LABELS, LOCAL_STAGE2_URLS } from '../config/localModels'

export function useActiveModels() {
  const dispatch = useDispatch()

  useEffect(() => {
    async function load() {
      try {
        const { data, error } = await supabase
          .from('model_deployments')
          .select('stage, material_type, model_files(model_url, metadata_url, class_labels, format, version_tag)')
          .eq('is_active', true)

        if (!error && data?.length) {
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

          if (tmStage1Url) {
            const modelVersion = data.find(r => r.stage === 1)?.model_files?.version_tag ?? 'v0-mock'
            dispatch(setAiConfig({ tmStage1Url, stage1ClassLabels, tmStage2Urls, modelVersion }))
            return
          }
        }
      } catch {
        // Supabase not configured — fall through to local models
      }

      // Use local models from public/model_ai/
      dispatch(setAiConfig({
        tmStage1Url:       LOCAL_STAGE1_URL,
        stage1ClassLabels: LOCAL_STAGE1_LABELS,
        tmStage2Urls:      LOCAL_STAGE2_URLS,
        modelVersion:      'v1-local',
      }))
    }

    load()
  }, [dispatch])
}
