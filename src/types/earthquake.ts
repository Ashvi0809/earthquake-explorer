// Interface for each earthquake data row
export interface EarthquakeRow {
  time: string
  latitude: number
  longitude: number
  depth: number
  mag: number
  magType: string
  nst: number
  gap: number
  dmin: number
  rms: number
  net: string
  id: string
  updated: string
  place: string
  type: string
  horizontalError: number
  depthError: number
  magError: number
  magNst: number
  status: string
  locationSource: string
  magSource: string
}

// Type for keys that represent numeric values
export type NumericKey = 'mag' | 'depth' | 'latitude' | 'longitude' | 'gap' | 'dmin' | 'rms' | 'nst'

// List of numeric columns for dropdowns
export const NUMERIC_COLUMNS: { key: NumericKey; label: string }[] = [
  { key: 'mag', label: 'Magnitude' },
  { key: 'depth', label: 'Depth (km)' },
  { key: 'latitude', label: 'Latitude' },
  { key: 'longitude', label: 'Longitude' },
  { key: 'gap', label: 'Gap' },
  { key: 'dmin', label: 'Distance (dmin)' },
  { key: 'rms', label: 'RMS' },
  { key: 'nst', label: 'Stations (nst)' },
]