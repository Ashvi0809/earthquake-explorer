import { useQuery } from '@tanstack/react-query'
import Papa from 'papaparse'
import type { EarthquakeRow } from '../types/earthquake'

const CSV_URL = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.csv'

function parseNumber(val: string): number {
  const n = parseFloat(val)
  return isNaN(n) ? 0 : n
}

async function fetchEarthquakes(): Promise<EarthquakeRow[]> {
  const response = await fetch(CSV_URL)
  const text = await response.text()

  return new Promise((resolve, reject) => {
    Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = (results.data as Record<string, string>[]).map((row) => ({
          time: row.time ?? '',
          latitude: parseNumber(row.latitude),
          longitude: parseNumber(row.longitude),
          depth: parseNumber(row.depth),
          mag: parseNumber(row.mag),
          magType: row.magType ?? '',
          nst: parseNumber(row.nst),
          gap: parseNumber(row.gap),
          dmin: parseNumber(row.dmin),
          rms: parseNumber(row.rms),
          net: row.net ?? '',
          id: row.id ?? '',
          updated: row.updated ?? '',
          place: row.place ?? '',
          type: row.type ?? '',
          horizontalError: parseNumber(row.horizontalError),
          depthError: parseNumber(row.depthError),
          magError: parseNumber(row.magError),
          magNst: parseNumber(row.magNst),
          status: row.status ?? '',
          locationSource: row.locationSource ?? '',
          magSource: row.magSource ?? '',
        }))
        resolve(rows)
      },
      error: reject,
    })
  })
}

export function useEarthquakeData() {
  return useQuery({
    queryKey: ['earthquakes'],
    queryFn: fetchEarthquakes,
    staleTime: 5 * 60 * 1000, // cache for 5 minutes
  })
}