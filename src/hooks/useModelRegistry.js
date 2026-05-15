// Manages model_files + model_deployments CRUD for AI Studio admin UI

import { useState, useEffect, useCallback } from 'react'
import { useSelector } from 'react-redux'
import { supabase } from '../lib/supabase'

export function useModelRegistry() {
  const session = useSelector(s => s.user.session)
  const userId  = session?.user?.id ?? null

  const [files,       setFiles]       = useState([])
  const [deployments, setDeployments] = useState([])
  const [loading,     setLoading]     = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [{ data: f }, { data: d }] = await Promise.all([
        supabase.from('model_files').select('*').order('created_at', { ascending: false }),
        supabase.from('model_deployments').select('*').order('activated_at', { ascending: false }),
      ])
      setFiles(f ?? [])
      setDeployments(d ?? [])
    } catch {
      // table not migrated yet
    } finally {
      setLoading(false)
    }
  }, [])

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load() }, [load])

  // Upload model.json + weights to Supabase Storage, then insert into model_files
  async function uploadModel({ stage, materialType, versionTag, modelFile, metadataFile }) {
    const ts      = Date.now()
    const folder  = stage === 1 ? `stage1/${ts}` : `stage2/${materialType ?? 'unknown'}/${ts}`

    // Upload model.json
    const modelPath = `${folder}/model.json`
    const { error: upErr } = await supabase.storage
      .from('models')
      .upload(modelPath, modelFile, { contentType: 'application/json', upsert: false })
    if (upErr) throw new Error(`Upload failed: ${upErr.message}`)

    const { data: urlData } = supabase.storage.from('models').getPublicUrl(modelPath)
    const modelUrl = urlData.publicUrl

    // Upload metadata.json (optional — contains class labels from TM)
    let metadataUrl    = null
    let classLabels    = null
    if (metadataFile) {
      const metaPath = `${folder}/metadata.json`
      await supabase.storage
        .from('models')
        .upload(metaPath, metadataFile, { contentType: 'application/json', upsert: false })
      const { data: metaUrl } = supabase.storage.from('models').getPublicUrl(metaPath)
      metadataUrl = metaUrl.publicUrl

      // Parse class labels from metadata.json
      try {
        const text = await metadataFile.text()
        const meta = JSON.parse(text)
        classLabels = meta.labels ?? meta.classLabels ?? null
      } catch { /* malformed metadata — class_labels stays null */ }
    }

    const { data, error } = await supabase.from('model_files').insert({
      stage,
      material_type: stage === 1 ? null : (materialType ?? null),
      format:        'tfjs',
      model_url:     modelUrl,
      metadata_url:  metadataUrl,
      class_labels:  classLabels,
      version_tag:   versionTag || null,
      uploaded_by:   userId,
    }).select().single()

    if (error) throw new Error(error.message)
    await load()
    return data
  }

  // Register a model by URL only (no file upload — e.g. TM share link)
  async function registerModelUrl({ stage, materialType, versionTag, modelUrl, classLabels }) {
    const { data, error } = await supabase.from('model_files').insert({
      stage,
      material_type: stage === 1 ? null : (materialType ?? null),
      format:        'tfjs',
      model_url:     modelUrl,
      metadata_url:  null,
      class_labels:  classLabels?.length ? classLabels : null,
      version_tag:   versionTag || null,
      uploaded_by:   userId,
    }).select().single()
    if (error) throw new Error(error.message)
    await load()
    return data
  }

  // Activate a model_file — deactivates previous for same (stage, materialType)
  async function activateModel(modelFileId, stage, materialType) {
    // Deactivate current active for this (stage, materialType)
    await supabase
      .from('model_deployments')
      .update({ is_active: false })
      .eq('stage', stage)
      .eq('material_type', materialType ?? null)
      .eq('is_active', true)

    const { error } = await supabase.from('model_deployments').insert({
      stage,
      material_type: materialType ?? null,
      model_file_id: modelFileId,
      is_active:     true,
      activated_by:  userId,
    })
    if (error) throw new Error(error.message)
    await load()
  }

  const activeByKey = {}
  for (const d of deployments.filter(d => d.is_active)) {
    const key = d.stage === 1 ? '__stage1__' : d.material_type
    activeByKey[key] = d.model_file_id
  }

  return { files, deployments, activeByKey, loading, uploadModel, registerModelUrl, activateModel, reload: load }
}
