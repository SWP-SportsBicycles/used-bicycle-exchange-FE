export type DataSourceMode = 'mock' | 'live'

export function getDataSourceMode(): DataSourceMode {
  const configured = process.env.NEXT_PUBLIC_DATA_SOURCE?.toLowerCase()
  return configured === 'live' ? 'live' : 'mock'
}

export function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_BASE_URL || ''
}
