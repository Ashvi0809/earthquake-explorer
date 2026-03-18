import { useContext, useState } from 'react'
import type { ReactNode } from 'react'
import type { EarthquakeRow } from '../types/earthquake'
import { SelectionContext } from './SelectionContextDef'


export interface SelectionContextType {
  selectedEntry: EarthquakeRow | null
  setSelectedEntry: (entry: EarthquakeRow | null) => void
}

// Context provider for managing the currently selected earthquake entry across the app
export function SelectionProvider({ children }: { children: ReactNode }) {
  const [selectedEntry, setSelectedEntry] = useState<EarthquakeRow | null>(null)
  return (
    <SelectionContext.Provider value={{ selectedEntry, setSelectedEntry }}>
      {children}
    </SelectionContext.Provider>
  )
}

// Custom hook to use the selection context
export function useSelection() {
  const ctx = useContext(SelectionContext)
  if (!ctx) throw new Error('useSelection must be used within SelectionProvider')
  return ctx
}