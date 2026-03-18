import { useState, useCallback, useMemo } from 'react'
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from 'recharts'
import { useEarthquakeStore } from '../../store/useEarthquakeStore'
import { useSelection } from '../../context/SelectionContext'
import { NUMERIC_COLUMNS } from '../../types/earthquake'
import type { NumericKey, EarthquakeRow } from '../../types/earthquake'


interface Props {
  data: EarthquakeRow[]
}

// ChartPanel component: displays a scatter plot of earthquake data with interactive tooltips and selection
export default function ChartPanel({ data }: Props) {
  const [xKey, setXKey] = useState<NumericKey>('longitude')
  const [yKey, setYKey] = useState<NumericKey>('latitude')

  const hoveredId    = useEarthquakeStore(s => s.hoveredId)
  const selectedId   = useEarthquakeStore(s => s.selectedId)
  const setHoveredId   = useEarthquakeStore(s => s.setHoveredId)
  const setSelectedId  = useEarthquakeStore(s => s.setSelectedId)
  const { setSelectedEntry } = useSelection()

  //  Limit to 2000 points for performance — keeps chart snappy
  const chartData = useMemo(() => data.slice(0, 2000), [data])

  const handleMouseEnter = useCallback((_: any, __: any, e: any) => {
    const id = e?.activePayload?.[0]?.payload?.id
    if (id) setHoveredId(id)
  }, [setHoveredId])

  const handleMouseLeave = useCallback(() => {
    setHoveredId(null)
  }, [setHoveredId])

  // Recharts Scatter onClick receives the data entry directly
  const handleDotClick = useCallback((entry: any) => {
    if (entry?.id) {
      setSelectedId(entry.id)
      setSelectedEntry(entry as EarthquakeRow)
    }
  }, [setSelectedId, setSelectedEntry])

  const getDotColor = (entry: EarthquakeRow) => {
    if (entry.id === selectedId) return '#facc15'
    if (entry.id === hoveredId)  return '#fb923c'
    if (entry.mag >= 5)          return '#ef4444'
    if (entry.mag >= 3)          return '#f97316'
    return '#475569'
  }

  const getDotSize = (entry: EarthquakeRow) => {
    if (entry.id === selectedId) return 80
    if (entry.id === hoveredId)  return 60
    return Math.max(10, entry.mag * entry.mag * 2)
  }

  return (
    <div className="flex flex-col h-full bg-gray-900 rounded-xl border border-gray-800 p-4 gap-3">

      {/* Axis controls */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-gray-500 text-xs uppercase tracking-wider">Axes</span>
        <div className="flex items-center gap-2">
          <label className="text-gray-400 text-xs">X:</label>
          <select
            value={xKey}
            onChange={e => setXKey(e.target.value as NumericKey)}
            className="bg-gray-800 border border-gray-700 text-gray-200 text-xs rounded px-2 py-1 focus:outline-none focus:border-orange-500"
          >
            {NUMERIC_COLUMNS.map(c => (
              <option key={c.key} value={c.key}>{c.label}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-gray-400 text-xs">Y:</label>
          <select
            value={yKey}
            onChange={e => setYKey(e.target.value as NumericKey)}
            className="bg-gray-800 border border-gray-700 text-gray-200 text-xs rounded px-2 py-1 focus:outline-none focus:border-orange-500"
          >
            {NUMERIC_COLUMNS.map(c => (
              <option key={c.key} value={c.key}>{c.label}</option>
            ))}
          </select>
        </div>
        <span className="ml-auto text-gray-600 text-xs">
          showing {chartData.length.toLocaleString()} of {data.length.toLocaleString()} points
        </span>
      </div>

      {/* Chart */}
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%" minHeight={200}>
          <ScatterChart margin={{ top: 10, right: 20, bottom: 30, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis
              dataKey={xKey}
              type="number"
              name={xKey}
              domain={['auto', 'auto']}
              tick={{ fill: '#6b7280', fontSize: 10 }}
              label={{
                value: NUMERIC_COLUMNS.find(c => c.key === xKey)?.label,
                position: 'insideBottom',
                offset: -15,
                fill: '#9ca3af',
                fontSize: 11
              }}
            />
            <YAxis
              dataKey={yKey}
              type="number"
              name={yKey}
              domain={['auto', 'auto']}
              tick={{ fill: '#6b7280', fontSize: 10 }}
              label={{
                value: NUMERIC_COLUMNS.find(c => c.key === yKey)?.label,
                angle: -90,
                position: 'insideLeft',
                offset: 10,
                fill: '#9ca3af',
                fontSize: 11
              }}
            />
            <Tooltip
              cursor={{ strokeDasharray: '3 3', stroke: '#374151' }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null
                const d = payload[0].payload as EarthquakeRow
                return (
                  <div className="bg-gray-800 border border-gray-700 rounded p-2 text-xs max-w-[220px]">
                    <p className="text-orange-400 font-semibold mb-1">M{d.mag} — {d.place}</p>
                    <p className="text-gray-300">{xKey}: <span className="text-white">{d[xKey]}</span></p>
                    <p className="text-gray-300">{yKey}: <span className="text-white">{d[yKey]}</span></p>
                    <p className="text-gray-300">Depth: <span className="text-white">{d.depth} km</span></p>
                    <p className="text-gray-500 mt-1 text-[10px]">Click to select row</p>
                  </div>
                )
              }}
            />
            <Scatter
              data={chartData}
              onClick={(entry) => handleDotClick(entry)}
              onMouseLeave={handleMouseLeave}
            >
              {chartData.map((entry) => (
                <Cell
                  key={entry.id}
                  fill={getDotColor(entry)}
                  r={getDotSize(entry)}
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={() => setHoveredId(entry.id)}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-xs text-gray-500 justify-end">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-slate-500 inline-block" />M &lt; 3
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-orange-500 inline-block" />M 3–5
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />M &gt; 5
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" />Selected
        </span>
      </div>
    </div>
  )
}