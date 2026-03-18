import { createContext } from 'react'
import type { SelectionContextType } from './SelectionContext'

// Define the context for managing the currently selected earthquake entry across the app
export const SelectionContext = createContext<SelectionContextType | null>(null)