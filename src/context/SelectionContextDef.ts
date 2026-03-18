import { createContext } from 'react'
import type { SelectionContextType } from './SelectionContext'

export const SelectionContext = createContext<SelectionContextType | null>(null)