import { useState, useEffect } from 'react'
import { useAuth } from './useAuth'
import { ApiError } from '../lib/api'

interface ApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

export function useApi<T>(
  apiCall: () => Promise<T>,
  dependencies: any[] = []
): ApiState<T> & { refetch: () => void } {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: true,
    error: null
  })
  const { handleTokenExpiration } = useAuth()

  const fetchData = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    try {
      const data = await apiCall()
      setState({ data, loading: false, error: null })
    } catch (error) {
      const apiError = error as ApiError
      if (apiError.isTokenExpired) {
        handleTokenExpiration()
      }
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : 'An error occurred'
      })
    }
  }

  useEffect(() => {
    fetchData()
  }, dependencies)

  return { ...state, refetch: fetchData }
}
