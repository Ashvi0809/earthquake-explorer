import { useEffect, useRef, useCallback, useMemo } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useEarthquakeStore } from '../../store/useEarthquakeStore'
import { useSelection } from '../../context/SelectionContext'
import type { EarthquakeRow } from '../../types/earthquake'

const COLUMNS: { key: keyof EarthquakeRow; label: string; width: string }[] = [
  { key: 'time',      label: 'Time',      width: '160px' },
  { key: 'place',     label: 'Place',     width: '200px' },
  { key: 'mag',       label: 'Mag',       width: '60px'  },
  { key: 'magType',   label: 'Type',      width: '60px'  },
  { key: 'depth',     label: 'Depth(km)', width: '90px'  },
  { key: 'latitude',  label: 'Lat',       width: '80px'  },
  { key: 'longitude', label: 'Lon',       width: '80px'  },
  { key: 'gap',       label: 'Gap',       width: '60px'  },
  { key: 'rms',       label: 'RMS',       width: '60px'  },
  { key: 'net',       label: 'Net',       width: '50px'  },
  { key: 'status',    label: 'Status',    width: '80px'  },
  { key: 'id',        label: 'ID',        width: '140px' },
]

const ROW_HEIGHT = 32

interface Props {
  data: EarthquakeRow[]
}

export default function DataPanel({ data }: Props) {
  const hoveredId     = useEarthquakeStore(s => s.hoveredId)
  const selectedId    = useEarthquakeStore(s => s.selectedId)
  const setHoveredId  = useEarthquakeStore(s => s.setHoveredId)
  const setSelectedId = useEarthquakeStore(s => s.setSelectedId)
  const { setSelectedEntry } = useSelection()

  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 10, // render 10 extra rows above/below viewport
  })

  // Build index map for O(1) lookup by id
  const indexById = useMemo(() => {
    const map = new Map<string, number>()
    data.forEach((row, i) => map.set(row.id, i))
    return map
  }, [data])

  // Auto-scroll to selected row instantly when selectedId changes
  useEffect(() => {
    if (selectedId) {
      const index = indexById.get(selectedId)
      if (index !== undefined) {
        virtualizer.scrollToIndex(index, { align: 'center', behavior: 'smooth' })
      }
    }
  }, [selectedId, indexById, virtualizer])

  const handleRowClick = useCallback((row: EarthquakeRow) => {
    setSelectedId(row.id)
    setSelectedEntry(row)
  }, [setSelectedId, setSelectedEntry])

  function formatTime(t: string) {
    try { return new Date(t).toLocaleString() } catch { return t }
  }

  function magColor(mag: number) {
    if (mag >= 5) return 'text-red-400 font-bold'
    if (mag >= 3) return 'text-orange-400 font-semibold'
    return 'text-gray-400'
  }

  const virtualItems = virtualizer.getVirtualItems()

  return (
    <div className="flex flex-col h-full bg-gray-900 rounded-xl border border-gray-800">

      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between flex-shrink-0">
        <span className="text-gray-400 text-xs uppercase tracking-wider">Data Table</span>
        <span className="text-gray-600 text-xs">{data.length.toLocaleString()} rows</span>
      </div>

      {/* Sticky column headers */}
      <div className="flex-shrink-0 overflow-hidden border-b border-gray-800 bg-gray-950">
        <div className="flex">
          {COLUMNS.map(col => (
            <div
              key={col.key}
              className="px-3 py-2 text-left text-gray-500 font-medium text-xs whitespace-nowrap flex-shrink-0"
              style={{ width: col.width, minWidth: col.width }}
            >
              {col.label}
            </div>
          ))}
        </div>
      </div>

      {/* Virtualized rows — only ~20 rows in DOM at any time */}
      <div
        ref={parentRef}
        className="flex-1 overflow-auto"
      >
        <div
          style={{ height: virtualizer.getTotalSize(), position: 'relative' }}
        >
          {virtualItems.map(virtualRow => {
            const row = data[virtualRow.index]
            const isSelected = row.id === selectedId
            const isHovered  = row.id === hoveredId

            return (
              <div
                key={row.id}
                data-index={virtualRow.index}
                ref={virtualizer.measureElement}
                onClick={() => handleRowClick(row)}
                onMouseEnter={() => setHoveredId(row.id)}
                onMouseLeave={() => setHoveredId(null)}
                className={`
                  flex absolute w-full cursor-pointer border-b border-gray-800/50 transition-colors
                  ${isSelected ? 'bg-yellow-400/10 border-l-2 border-l-yellow-400' : ''}
                  ${isHovered && !isSelected ? 'bg-orange-500/10' : ''}
                  ${!isSelected && !isHovered ? 'hover:bg-gray-800/50' : ''}
                `}
                style={{
                  top: virtualRow.start,
                  height: ROW_HEIGHT,
                }}
              >
                {/* Time */}
                <div className="px-3 flex items-center text-gray-400 text-xs whitespace-nowrap flex-shrink-0" style={{ width: '160px' }}>
                  {formatTime(row.time)}
                </div>
                {/* Place */}
                <div className="px-3 flex items-center text-gray-300 text-xs whitespace-nowrap overflow-hidden flex-shrink-0" style={{ width: '200px' }}>
                  <span className="truncate">{row.place}</span>
                </div>
                {/* Mag */}
                <div className={`px-3 flex items-center text-xs whitespace-nowrap flex-shrink-0 ${magColor(row.mag)}`} style={{ width: '60px' }}>
                  {row.mag}
                </div>
                {/* MagType */}
                <div className="px-3 flex items-center text-gray-500 text-xs whitespace-nowrap flex-shrink-0" style={{ width: '60px' }}>
                  {row.magType}
                </div>
                {/* Depth */}
                <div className="px-3 flex items-center text-gray-400 text-xs whitespace-nowrap flex-shrink-0" style={{ width: '90px' }}>
                  {row.depth}
                </div>
                {/* Lat */}
                <div className="px-3 flex items-center text-gray-400 text-xs whitespace-nowrap flex-shrink-0" style={{ width: '80px' }}>
                  {row.latitude.toFixed(3)}
                </div>
                {/* Lon */}
                <div className="px-3 flex items-center text-gray-400 text-xs whitespace-nowrap flex-shrink-0" style={{ width: '80px' }}>
                  {row.longitude.toFixed(3)}
                </div>
                {/* Gap */}
                <div className="px-3 flex items-center text-gray-500 text-xs whitespace-nowrap flex-shrink-0" style={{ width: '60px' }}>
                  {row.gap}
                </div>
                {/* RMS */}
                <div className="px-3 flex items-center text-gray-500 text-xs whitespace-nowrap flex-shrink-0" style={{ width: '60px' }}>
                  {row.rms}
                </div>
                {/* Net */}
                <div className="px-3 flex items-center text-gray-500 text-xs whitespace-nowrap flex-shrink-0" style={{ width: '50px' }}>
                  {row.net}
                </div>
                {/* Status */}
                <div className="px-3 flex items-center text-xs whitespace-nowrap flex-shrink-0" style={{ width: '80px' }}>
                  <span className={`px-1.5 py-0.5 rounded text-xs ${row.status === 'reviewed' ? 'bg-green-900/50 text-green-400' : 'bg-gray-800 text-gray-500'}`}>
                    {row.status}
                  </span>
                </div>
                {/* ID */}
                <div className="px-3 flex items-center text-gray-600 text-xs whitespace-nowrap font-mono flex-shrink-0" style={{ width: '140px' }}>
                  {row.id}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}