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