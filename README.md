# Local Basketball Reference Stats App - DuckDB Data Integration

This document outlines the setup and data ingestion process for the DuckDB database within the React application.

## Overview
This part of the application is responsible for setting up a DuckDB-WASM database in a web worker, defining the necessary table schemas, and ingesting data from local CSV files into these tables. The database file (`stats.duckdb`) is persisted to ensure data availability across sessions.

## Setup Steps

1.  **Install Dependencies**: Ensure `duckdb-wasm` and other necessary dependencies (e.g., `papaparse` if used as a fallback) are installed.
    ```bash
    npm install duckdb-wasm @duckdb/duckdb-wasm
    # If papaparse is needed for specific transformations:
    # npm install papaparse
    ```
2.  **Create `src/data` directory**: If it doesn't exist, create a `data` directory inside `src` to house the DuckDB related files.
3.  **Add `duckdb.js`**: Create the `src/data/duckdb.js` file with the DuckDB initialization, schema definition, and data ingestion logic.
4.  **Integrate into `App.js`**: Call the initialization function from `src/data/duckdb.js` within your main application component (e.g., `src/App.js`) to ensure the database is set up and data is ingested when the application starts.
5.  **Serve CSV files**: Ensure your development server is configured to serve the CSV files from the `csv/` directory so they are accessible by the web worker. For `create-react-app`, you might place the `csv` directory directly into the `public` folder, or configure a proxy if using `vite` or `webpack`.

## File Structure

```
.
├── public/
│   └── csv/
│       ├── player.csv
│       └── ... (other CSV files)
├── src/
│   ├── data/
│   │   └── duckdb.js
│   └── App.js
└── README.md
```

## Running the Application

After performing the setup steps:

1.  Place your CSV files into the `public/csv/` directory (or configure your server to serve them from `csv/`).
2.  Run your React application:
    ```bash
    npm start
    ```
    or
    ```bash
    npm run dev
    ```

The `stats.duckdb` file will be created and persisted in the browser's IndexedDB.

## StatsTable Component Usage

The `StatsTable` component is a reusable table component that matches Basketball-Reference.com's styling and functionality.

### Basic Usage

```javascript
import StatsTable from './components/StatsTable';
import useQuery from './hooks/useQuery';

function MyComponent() {
  // Use the useQuery hook to fetch and manage sorted data
  const { data, loading, error, sortConfig, requestSort } = useQuery(
    "SELECT * FROM PlayerSeasonStats WHERE player_id = ?",
    ['jamesle01']
  );

  // Define column specifications
  const columns = [
    { key: 'season', label: 'Season', type: 'text', sortable: true },
    { key: 'team', label: 'Team', type: 'link', sortable: true, 
      linkPath: (value) => `/teams/${value}` },
    { key: 'ppg', label: 'PPG', type: 'numeric', decimals: 1, sortable: true },
    { key: 'rpg', label: 'RPG', type: 'numeric', decimals: 1, sortable: true },
    { key: 'apg', label: 'APG', type: 'numeric', decimals: 1, sortable: true }
  ];

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <StatsTable
      data={data}
      columns={columns}
      sortConfig={sortConfig}
      requestSort={requestSort}
      exportable={true}
      exportFilename="player-stats"
      caption="Season Statistics"
    />
  );
}
```

### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| data | Array | Yes | - | Array of objects to display |
| columns | Array | Yes | - | Column definitions |
| sortConfig | Object | Yes | - | Current sort state from useQuery |
| requestSort | Function | Yes | - | Sort handler from useQuery |
| exportable | Boolean | No | true | Show CSV export button |
| exportFilename | String | No | 'stats' | Base filename for exports |
| className | String | No | '' | Additional CSS classes |
| caption | String | No | - | Table caption for accessibility |
| responsive | Boolean | No | true | Enable responsive behavior |
| mobileColumns | Array | No | [] | Column keys to show on mobile |

### Column Definition

```javascript
{
  key: 'ppg',              // Object property to display
  label: 'PPG',            // Column header text
  type: 'numeric',         // 'text' | 'numeric' | 'link'
  sortable: true,          // Enable sorting
  decimals: 1,             // Decimal places (0, 1, or 3)
  linkPath: (val, row) => `/path`, // For link columns
  formatter: (val, row) => string, // Custom formatter
  mobileHide: true        // Hide on mobile devices
}
```

### Formatting Rules

- **Per-game stats**: Always displayed with 1 decimal place (e.g., 25.7, 7.0)
- **Percentages**: Displayed with 3 decimal places (e.g., 0.456)
- **Totals**: Displayed as integers (e.g., 82)
- **Missing data**: Displayed as "-"

### Demo

View a live demo of the StatsTable component at `/demo/stats-table` when running the development server.

## TODOs and Future Enhancements

### StatsTable Component
- [ ] Virtual scrolling for tables with 1000+ rows
- [ ] Advanced pagination with configurable page sizes
- [ ] Column resizing functionality
- [ ] Frozen/pinned columns for horizontal scrolling
- [ ] Advanced filtering UI (multi-column filters)
- [ ] Keyboard navigation improvements
- [ ] Print-friendly styling
- [ ] Dark mode support

### Accessibility
- [ ] Screen reader announcements for sort changes
- [ ] Keyboard shortcuts for common actions
- [ ] High contrast mode support
- [ ] Focus management improvements

### Performance
- [ ] Memoization of expensive calculations
- [ ] Web Worker for CSV export of large datasets
- [ ] Lazy loading for table rows
- [ ] Progressive enhancement for slow connections

### Additional Features
- [ ] Copy to clipboard functionality
- [ ] Column visibility toggles
- [ ] Save table preferences to localStorage
- [ ] Advanced export options (Excel, PDF)
- [ ] Comparison mode (highlight differences between rows)
- [ ] Inline editing capabilities (if needed)