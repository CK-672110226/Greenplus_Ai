import { useEffect, useReducer, useCallback } from 'react'

function reducer(state, action) {
  switch (action.type) {
    case 'PENDING':  return { data: state.data, loading: true,  error: null }
    case 'SUCCESS':  return { data: action.data,  loading: false, error: null }
    case 'ERROR':    return { data: state.data,   loading: false, error: action.error }
    default:         return state
  }
}

/**
 * Standardized async data-fetching hook.
 * Returns { data, loading, error }.
 *
 * Wrap queryFn in useCallback so the query only re-runs when its deps change:
 *   const fetchShops = useCallback(() => supabase.from('shops').select('*')
 *     .then(r => { if (r.error) throw r.error; return r.data }), [])
 *   const { data, loading, error } = useQuery(fetchShops)
 */
export function useQuery(queryFn) {
  const [state, dispatch] = useReducer(reducer, { data: null, loading: true, error: null })

  useEffect(() => {
    let cancelled = false
    dispatch({ type: 'PENDING' })
    Promise.resolve(queryFn()).then(data => {
      if (!cancelled) dispatch({ type: 'SUCCESS', data })
    }).catch(err => {
      if (!cancelled) dispatch({ type: 'ERROR', error: err?.message ?? 'Request failed' })
    })
    return () => { cancelled = true }
  }, [queryFn])

  return { data: state.data, loading: state.loading, error: state.error }
}

export { useCallback }
