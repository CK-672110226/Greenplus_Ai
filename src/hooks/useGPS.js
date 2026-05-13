import { useState, useCallback } from 'react'

export function useGPS() {
  const [state, setState] = useState({ lat: null, lng: null, loading: false, error: null })

  const request = useCallback(() => {
    if (!navigator.geolocation) {
      setState(s => ({ ...s, error: 'not_supported', loading: false }))
      return
    }
    setState(s => ({ ...s, loading: true, error: null }))
    navigator.geolocation.getCurrentPosition(
      pos => setState({ lat: pos.coords.latitude, lng: pos.coords.longitude, loading: false, error: null }),
      err => setState(s => ({ ...s, loading: false, error: err.message })),
      { timeout: 8000, maximumAge: 60000 }
    )
  }, [])

  return { ...state, request }
}
