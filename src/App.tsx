import { useEffect } from 'react'
import { useEarthquakeData } from './hooks/useEarthquakeData'
import { useEarthquakeStore } from './store/useEarthquakeStore'
import { useSelection } from './context/SelectionContext'
import ChartPanel from './components/ChartPanel/ChartPanel'
import DataPanel from './components/DataPanel/DataPanel'

export default function App() {
  const { data, isLoading, isError } = useEarthquakeData()
  const setEarthquakes = useEarthquakeStore(s => s.setEarthquakes)
  const earthquakes    = useEarthquakeStore(s => s.earthquakes)
  const { selectedEntry } = useSelection()

  useEffect(() => {
    if (data) setEarthquakes(data)
  }, [data, setEarthquakes])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400 text-sm tracking-widest uppercase">Loading earthquake data…</p>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-red-400">Failed to load data. Please refresh.</p>
      </div>
    )
  }

  return (
    <div className="h-screen bg-gray-950 text-white flex flex-col overflow-hidden">

      {/* Header */}
      <header className="px-6 py-3 border-b border-gray-800 flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-lg font-bold text-orange-400 tracking-wide">
            🌍 Earthquake Explorer
          </h1>
          <p className="text-gray-500 text-xs">
            {earthquakes.length.toLocaleString()} events · Last 30 days · Source: USGS
          </p>
        </div>
        {selectedEntry && (
          <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-lg px-4 py-2 text-xs">
            <span className="text-yellow-400 font-semibold">Selected: </span>
            <span className="text-gray-300">M{selectedEntry.mag} — {selectedEntry.place}</span>
          </div>
        )}
      </header>

      {/* Two-panel layout */}
      <main className="flex-1 flex gap-4 p-4 min-h-0">

        {/* Left: Chart Panel (props pattern — data passed via props) */}
        <div className="w-1/2 min-h-0">
          <ChartPanel data={earthquakes} />
        </div>

        {/* Right: Data Panel (props pattern — data passed via props) */}
        <div className="w-1/2 min-h-0">
          <DataPanel data={earthquakes} />
        </div>

      </main>
    </div>
  )
}