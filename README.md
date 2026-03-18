# Earthquake Explorer

An interactive single-page web application that visualizes real-time earthquake data from the USGS. Built as a frontend developer assessment project.

## Preview

Two-panel layout with an interactive scatter chart on the left and a scrollable data table on the right. Hover or click either panel to highlight the matching entry in the other.

## Live Data Source

Fetches the past 30 days of global earthquake activity from the USGS Earthquake Hazards Program.
URL: https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.csv
Approximately 10,000+ events updated in real time.

## Features

- Two-panel responsive layout, side by side on desktop, stacked on mobile below 514px
- Interactive scatter plot where X and Y axes are user-selectable from any numeric column
- Magnitude-based color coding where Grey is M less than 3, Orange is M 3 to 5, Red is M greater than 5, and Yellow is the selected entry
- Bidirectional hover and selection where hovering a table row highlights the matching chart dot, hovering a chart dot highlights the matching table row, and clicking either selects the entry and auto-scrolls the table to that row
- Selected entry banner in the header showing earthquake magnitude and location
- Loading spinner while data is being fetched and parsed
- Virtual scrolling so only around 20 rows are rendered in the DOM at a time for smooth performance with 10,000+ rows
- Chart renders first 2,000 points to keep interactions snappy

## Tech Stack

react v19 — UI framework
typescript v5 — Type safety throughout the codebase
vite v8 — Build tool and development server
tailwindcss v4 — Utility-first CSS styling
@tanstack/react-query v5 — Data fetching, caching, loading and error states
@tanstack/react-router v1 — Routing setup for future multi-page expansion
@tanstack/react-virtual v3 — Virtual scrolling for 10,000+ table rows
zustand v5 — Global state management for hover and selection sync
recharts v2 — Declarative scatter chart visualization
papaparse v5 — CSV parsing of USGS earthquake feed
clsx v2 — Conditional className utility

## Project Structure
```
src/
├── components/
│   ├── ChartPanel/
│   │   └── ChartPanel.tsx      # Recharts scatter plot with axis dropdowns and dot interactions
│   └── DataPanel/
│       └── DataPanel.tsx       # Virtualized scrollable data table with row interactions
├── context/
│   ├── SelectionContext.tsx    # React Context that stores the full selected EarthquakeRow object
│   └── SelectionContextDef.ts  # Context object definition separated for HMR compatibility
├── hooks/
│   └── useEarthquakeData.ts    # TanStack Query hook that fetches and parses USGS CSV data
├── store/
│   └── useEarthquakeStore.ts   # Zustand store that manages hoveredId, selectedId, earthquakes array
├── types/
│   └── earthquake.ts           # TypeScript interfaces and numeric column definitions
├── App.tsx                     # Root layout, provider wrappers, two-panel structure
└── main.tsx                    # Application entry point and provider hierarchy
```

## State Management — Three Patterns Demonstrated

### 1. Props Pattern
App.tsx owns the earthquake array and passes it down to both panels as props.
```tsx
<ChartPanel data={earthquakes} />
<DataPanel data={earthquakes} />
```

### 2. React Context
SelectionContext stores the full selected EarthquakeRow object.
Used by the header banner to display selected earthquake details.
Wrapped at the app root so any component can access it without prop drilling.
```tsx
const { selectedEntry, setSelectedEntry } = useSelection()
```

### 3. Zustand Store
Global store syncs hover and click interactions between chart and table instantly.
```tsx
const hoveredId  = useEarthquakeStore(s => s.hoveredId)
const selectedId = useEarthquakeStore(s => s.selectedId)
```

Props pattern is best for simple one-way data flow from parent to child and is used for passing the earthquakes array down.
React Context is best for low-frequency updates that need rich object data and is used for the selected entry shown in the header.
Zustand is best for high-frequency cross-component updates and is used for syncing hover and click state between the chart and table.

## Getting Started

Prerequisites:
- Node.js 18+
- npm 9+

Installation:
```bash
git clone https://github.com/Ashvi0809/earthquake-explorer.git
cd earthquake-explorer
npm install
```

Run Development Server:
```bash
npm run dev
```

Open http://localhost:5173 in your browser.

Build for Production:
```bash
npm run build
npm run preview
```

## Responsive Behaviour

Below 514px the panels stack vertically with the chart at 350px height and the table at 400px height.
Above 514px the panels sit side by side and each fills the full screen height.

