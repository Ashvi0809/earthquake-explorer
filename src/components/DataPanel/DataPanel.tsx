import { useEffect, useRef, useCallback, useMemo } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useEarthquakeStore } from "../../store/useEarthquakeStore";
import { useSelection } from "../../context/SelectionContext";
import type { EarthquakeRow } from "../../types/earthquake";

// Define columns with keys, labels, and widths for the data table
const COLUMNS: { key: keyof EarthquakeRow; label: string; width: number }[] = [
  { key: "time", label: "Time", width: 170 },
  { key: "place", label: "Place", width: 220 },
  { key: "mag", label: "Mag", width: 65 },
  { key: "magType", label: "Type", width: 65 },
  { key: "depth", label: "Depth (km)", width: 120 },
  { key: "latitude", label: "Lat", width: 100 },
  { key: "longitude", label: "Lon", width: 100 },
  { key: "gap", label: "Gap", width: 75 },
  { key: "rms", label: "RMS", width: 75 },
  { key: "nst", label: "NST", width: 65 },
  { key: "net", label: "Net", width: 65 },
  { key: "status", label: "Status", width: 100 },
  { key: "locationSource", label: "Loc Source", width: 100 },
  { key: "magSource", label: "Mag Source", width: 100 },
  { key: "id", label: "ID", width: 160 },
];

// Fixed row height and total width for the table (used in virtualizer and styling)
const ROW_HEIGHT = 32;
const TOTAL_WIDTH = COLUMNS.reduce((sum, c) => sum + c.width, 0);


interface Props {
  data: EarthquakeRow[];
}

// DataPanel component: displays a virtualized table of earthquake data with hover and selection states
export default function DataPanel({ data }: Props) {
  const hoveredId = useEarthquakeStore((s) => s.hoveredId);
  const selectedId = useEarthquakeStore((s) => s.selectedId);
  const setHoveredId = useEarthquakeStore((s) => s.setHoveredId);
  const setSelectedId = useEarthquakeStore((s) => s.setSelectedId);
  const { setSelectedEntry } = useSelection();

  // Single scroll container — headers + rows scroll together horizontally
  const scrollRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 10,
  });

  const indexById = useMemo(() => {
    const map = new Map<string, number>();
    data.forEach((row, i) => map.set(row.id, i));
    return map;
  }, [data]);

  // Scroll to the selected row when selectedId changes
  useEffect(() => {
    if (selectedId) {
      const index = indexById.get(selectedId);
      if (index !== undefined) {
        setTimeout(() => {
          virtualizer.scrollToIndex(index, {
            align: "center",
            behavior: "smooth",
          });
        }, 50);
      }
    }
  }, [selectedId, indexById, virtualizer]);

  // Handle row click: set selected ID and entry in global state
  const handleRowClick = useCallback(
    (row: EarthquakeRow) => {
      setSelectedId(row.id);
      setSelectedEntry(row);
    },
    [setSelectedId, setSelectedEntry],
  );

  // Format time for display
  function formatTime(t: string) {
    try {
      return new Date(t).toLocaleString();
    } catch {
      return t;
    }
  }

  // Determine text color based on magnitude
  function magColor(mag: number) {
    if (mag >= 5) return "text-red-400 font-bold";
    if (mag >= 3) return "text-orange-400 font-semibold";
    return "text-gray-400";
  }

  const virtualItems = virtualizer.getVirtualItems();

  return (
    <div className="flex flex-col h-full bg-gray-900 rounded-xl border border-gray-800">
      {/* Panel header */}
      <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between flex-shrink-0">
        <span className="text-gray-400 text-xs uppercase tracking-wider">
          Data Table
        </span>
        <span className="text-gray-600 text-xs">
          {data.length.toLocaleString()} rows
        </span>
      </div>

      {/* Single scroll container — BOTH headers and rows scroll together */}
      <div ref={scrollRef} className="flex-1 overflow-auto">
        <div style={{ width: TOTAL_WIDTH, minWidth: "100%" }}>
          {/* Sticky header row — scrolls horizontally WITH the body */}
          <div
            className="flex sticky top-0 z-10 bg-gray-950 border-b border-gray-800"
            style={{ width: TOTAL_WIDTH }}
          >
            {COLUMNS.map((col) => (
              <div
                key={col.key}
                className="px-3 py-2 text-left text-gray-500 font-medium text-xs whitespace-nowrap flex-shrink-0"
                style={{ width: col.width, minWidth: col.width }}
              >
                {col.label}
              </div>
            ))}
          </div>

          {/* Virtualized body */}
          <div
            style={{
              height: virtualizer.getTotalSize(),
              position: "relative",
              width: TOTAL_WIDTH,
            }}
          >
            {virtualItems.map((virtualRow) => {
              const row = data[virtualRow.index];
              const isSelected = row.id === selectedId;
              const isHovered = row.id === hoveredId;

              return (
                <div
                  key={row.id}
                  data-index={virtualRow.index}
                  ref={virtualizer.measureElement}
                  onClick={() => handleRowClick(row)}
                  onMouseEnter={() => setHoveredId(row.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className={`
                    flex absolute cursor-pointer border-b border-gray-800/50 transition-colors
                    ${isSelected ? "bg-yellow-400/10 border-l-2 border-l-yellow-400" : ""}
                    ${isHovered && !isSelected ? "bg-orange-500/10" : ""}
                    ${!isSelected && !isHovered ? "hover:bg-gray-800/50" : ""}
                  `}
                  style={{
                    top: virtualRow.start,
                    height: ROW_HEIGHT,
                    width: TOTAL_WIDTH,
                  }}
                >
                  {/* Time */}
                  <div
                    className="px-3 flex items-center text-gray-400 text-xs whitespace-nowrap flex-shrink-0 overflow-hidden"
                    style={{ width: 170 }}
                  >
                    {formatTime(row.time)}
                  </div>
                  {/* Place */}
                  <div
                    className="px-3 flex items-center text-gray-300 text-xs flex-shrink-0 overflow-hidden"
                    style={{ width: 220 }}
                  >
                    <span className="truncate">{row.place}</span>
                  </div>
                  {/* Mag */}
                  <div
                    className={`px-3 flex items-center text-xs whitespace-nowrap flex-shrink-0 ${magColor(row.mag)}`}
                    style={{ width: 65 }}
                  >
                    {row.mag}
                  </div>
                  {/* MagType */}
                  <div
                    className="px-3 flex items-center text-gray-500 text-xs whitespace-nowrap flex-shrink-0"
                    style={{ width: 65 }}
                  >
                    {row.magType}
                  </div>
                  {/* Depth */}
                  <div
                    className="px-3 flex items-center text-gray-400 text-xs whitespace-nowrap flex-shrink-0"
                    style={{ width: 110 }}
                  >
                    {typeof row.depth === "number"
                      ? row.depth.toFixed(3)
                      : row.depth}
                  </div>
                  {/* Lat */}
                  <div
                    className="px-3 flex items-center text-gray-400 text-xs whitespace-nowrap flex-shrink-0"
                    style={{ width: 100 }}
                  >
                    {row.latitude.toFixed(4)}
                  </div>
                  {/* Lon */}
                  <div
                    className="px-3 flex items-center text-gray-400 text-xs whitespace-nowrap flex-shrink-0"
                    style={{ width: 100 }}
                  >
                    {row.longitude.toFixed(4)}
                  </div>
                  {/* Gap */}
                  <div
                    className="px-3 flex items-center text-gray-500 text-xs whitespace-nowrap flex-shrink-0"
                    style={{ width: 75 }}
                  >
                    {row.gap}
                  </div>
                  {/* RMS */}
                  <div
                    className="px-3 flex items-center text-gray-500 text-xs whitespace-nowrap flex-shrink-0"
                    style={{ width: 75 }}
                  >
                    {row.rms}
                  </div>
                  {/* NST */}
                  <div
                    className="px-3 flex items-center text-gray-500 text-xs whitespace-nowrap flex-shrink-0"
                    style={{ width: 65 }}
                  >
                    {row.nst}
                  </div>
                  {/* Net */}
                  <div
                    className="px-3 flex items-center text-gray-500 text-xs whitespace-nowrap flex-shrink-0"
                    style={{ width: 65 }}
                  >
                    {row.net}
                  </div>
                  {/* Status */}
                  <div
                    className="px-3 flex items-center text-xs whitespace-nowrap flex-shrink-0"
                    style={{ width: 100 }}
                  >
                    <span
                      className={`px-1.5 py-0.5 rounded text-xs ${row.status === "reviewed" ? "bg-green-900/50 text-green-400" : "bg-gray-800 text-gray-500"}`}
                    >
                      {row.status}
                    </span>
                  </div>
                  {/* Loc Source */}
                  <div
                    className="px-3 flex items-center text-gray-500 text-xs whitespace-nowrap flex-shrink-0"
                    style={{ width: 100 }}
                  >
                    {row.locationSource}
                  </div>
                  {/* Mag Source */}
                  <div
                    className="px-3 flex items-center text-gray-500 text-xs whitespace-nowrap flex-shrink-0"
                    style={{ width: 100 }}
                  >
                    {row.magSource}
                  </div>
                  {/* ID */}
                  <div
                    className="px-3 flex items-center text-gray-600 text-xs whitespace-nowrap font-mono flex-shrink-0"
                    style={{ width: 160 }}
                  >
                    {row.id}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
