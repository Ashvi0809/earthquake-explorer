import { create } from 'zustand'
import type { EarthquakeRow } from '../types/earthquake'

interface EarthquakeStore {
  // All loaded data
  earthquakes: EarthquakeRow[]
  setEarthquakes: (data: EarthquakeRow[]) => void

  // Hover/highlight state (from table OR chart)
  hoveredId: string | null
  setHoveredId: (id: string | null) => void

  // Click-selected state
  selectedId: string | null
  setSelectedId: (id: string | null) => void
}

export const useEarthquakeStore = create<EarthquakeStore>((set) => ({
  earthquakes: [],
  setEarthquakes: (data) => set({ earthquakes: data }),

  hoveredId: null,
  setHoveredId: (id) => set({ hoveredId: id }),

  selectedId: null,
  setSelectedId: (id) => set({ selectedId: id }),
}))