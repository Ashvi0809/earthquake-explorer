import { useQuery } from '@tanstack/react-query'
import Papa from 'papaparse'
import type { EarthquakeRow } from '../types/earthquake'

const CSV_URL = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.csv'

function parseNumber(val: string): number {
  const n = parseFloat(val)
  return isNaN(n) ? 0 : n
}

async function fetchEarthquakes(): Promise<EarthquakeRow[]> {
  // Fetch the CSV data
  const response = await fetch(CSV_URL)
  // Read as text for PapaParse
  const text = await response.text()

  return new Promise((resolve, reject) => {
    // Parse CSV with PapaParse
    Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        // console.log(results.data,"result")
        const rows = (results.data as Record<string, string>[]).map((row) => ({
          // Parse and convert fields, providing defaults for missing values
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
        // console.log("FINAL ROWS:", rows);
        resolve(rows)
      },
      error: reject,
    })
  })
}

// Custom hook to fetch earthquake data using React Query
export function useEarthquakeData() {
  return useQuery({
    queryKey: ['earthquakes'],
    queryFn: fetchEarthquakes,
    staleTime: 5 * 60 * 1000, // cache for 5 minutes
  })
}