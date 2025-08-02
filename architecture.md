# Local Basketball Reference Stats App: High-Level Architecture

This document outlines the high-level architecture and project structure for the "Local Basketball Reference Stats App," which aims to mirror Basketball-Reference.com's stats pages. The application prioritizes a client-side, offline-first approach using DuckDB-WASM for data management and React for the user interface.

## 1. Project Directory Structure

```
/
├── public/                 # Static assets, index.html. Served by web server (e.g., local dev server).
│   └── csv/                # Raw CSV data files (e.g., PlayerSeasonStats.csv), sourced from PRD.md:5-14
├── src/                    # React application source code
│   ├── components/         # Reusable UI components (buttons, generic tables, forms)
│   ├── pages/              # Top-level page components (e.g., PlayersIndex.js, PlayerDetail.js, TeamSeason.js)
│   ├── hooks/              # Custom React hooks (e.g., useDuckDB.js for data fetching abstraction)
│   ├── utils/              # Utility functions (e.g., data formatters, ID mappers for linking)
│   ├── services/           # Data services (e.g., duckdbService.js for DuckDB connection, initialization, and core query API)
│   └── App.js              # Main React application component, handles routing
│   └── index.js            # React app entry point
├── config/                 # Application configuration (e.g., database name, CSV paths mapping)
├── scripts/                # Utility scripts (e.g., one-time data pre-processing or database build scripts, if any)
├── .duckdb/                # Directory for persistent DuckDB WASM database state in browser's Origin Private File System (OPFS)
├── architecture.md         # This architecture document
├── PRD.md                  # Product Requirements Document for reference
├── package.json            # Node.js project configuration and dependencies
├── README.md               # Project README and quick start guide
```

## 2. Core Components/Modules

### Data Layer (`src/services/duckdbService.js`)
*   **Purpose:** Manages the DuckDB-WASM instance, database initialization, data ingestion, and provides an API for executing SQL queries.
*   **Key Responsibilities:**
    *   Initialize and manage the single `AsyncDuckDB` instance and its connection.
    *   Handle initial database creation and CSV ingestion from `/public/csv/` into DuckDB tables.
    *   Manage database persistence using browser storage mechanisms (IndexedDB/OPFS) as described in [PRD.md:140](PRD.md:140).
    *   Expose a consistent, Promise-based API for `executeQuery(sql, params)` to the UI layer.

### User Interface (UI) Components (`src/components/`, `src/pages/`)
*   **Purpose:** Renders the application visually, mirroring Basketball-Reference.com's pages [PRD.md:61-112](PRD.md:61-112). Developed with React, potentially leveraging Webflow-designed structures.
*   **Key Sub-Modules:**
    *   **Layout & Navigation:** Components forming the application shell, including header, navigation menu (linking to Players, Teams, Seasons, Drafts, Playoffs), and footer.
    *   **Generic Table Display Components (`StatsTable.js`):** Reusable React components for presenting tabular data with features like sorting, filtering, and potentially pagination/infinite scroll for large datasets. **Must implement Basketball-Reference.com styling:**
        *   Alternating row colors (white/#f0f0f0 stripes)
        *   Right-aligned numeric columns with consistent decimal places
        *   **CRITICAL: All per-game stats must display with exactly 1 decimal place (e.g., 7.0, 12.5, 0.9) - never as whole numbers**
        *   Sticky headers for long tables
        *   Sortable columns with clear visual indicators (arrows)
        *   Row hover effects for better UX
        *   Responsive design that maintains readability on mobile
        *   Export to CSV functionality
    *   **Page-Specific Components:** Dedicated components for rendering detailed content of BRef-mirroring pages:
        *   `PlayersIndex.js`: Lists all players with search/filter capabilities.
        *   `PlayerDetail.js`: Displays a specific player's career and season stats, bio, etc.
        *   `TeamsIndex.js`: Lists all franchises.
        *   `TeamSeason.js`: Shows a specific team's roster and stats for a given season.
        *   `SeasonSummary.js`: Aggregates league-wide stats, standings, and leaders for a season.
        *   `DraftClass.js`: Displays draft picks for a specific year.
        *   `PlayoffsBracket.js`: Visualizes playoff series outcomes for a season.
    *   **Interactive Elements:** Components for search bars, dropdowns, and buttons that trigger client-side data filtering and sorting leveraging DuckDB-WASM.

### Routing (`src/App.js` with React Router)
*   **Purpose:** Manages declarative client-side navigation within the Single Page Application (SPA).
*   **Key Responsibilities:**
    *   Defines routes corresponding to BRef's URL structure (e.g., `/players/:id`, `/teams/:teamId/:year`) [PRD.md:100](PRD.md:100).
    *   Enables smooth transitions between views without full page reloads.

### Data Linking Utilities (`src/utils/dataLinks.js`, `src/utils/idMappers.js`)
*   **Purpose:** Provides helper functions to construct URLs and identify related entities across different data tables.
*   **Key Responsibilities:**
    *   Generates internal application links (e.g., from a player ID to their detailed page).
    *   Manages complexities of team franchise linking to unify historical team codes under a consistent franchise ID [PRD.md:121-122](PRD.md:121-122).

### Utility Hooks (`src/hooks/useDuckDB.js`)
*   **Purpose:** Custom React Hooks that encapsulate the logic for fetching data from the `duckdbService` within React components, managing loading states and errors.
*   **Key Responsibilities:**
    *   Simplifies data retrieval for components, abstracting direct interaction with the DuckDB service.

### Supplementary CSV Handling (PapaParse - `src/services/csvUtils.js`)
*   **Purpose:** Primarily for CSV export functionality (e.g., exporting displayed table data to CSV). Can serve as a fallback for initial CSV ingestion if DuckDB-WASM's native reader encounters limitations [PRD.md:151-157](PRD.md:151-157).
*   **Key Responsibilities:**
    *   Provides `parseCSV()` and `unparseCSV()` functions.

## 3. Data Schema (High-Level)

The data schema mirrors Basketball-Reference's structure, focusing on normalizing data from source CSVs into interconnected tables. Primary keys (PK) and foreign keys (FK) are defined for robust linking, as noted in [PRD.md:119-122](PRD.md:119-122).

*   **`Players`**: Master list of players.
    *   `player_id` (PK): Unique alphanumeric ID (e.g., `jamesle01`).
    *   `player_name`, `dob`, etc.
    *   *Source CSVs:* `player.csv`, `common_player_info.csv`, `Player Career Info.csv`, `Player Directory.csv`
*   **`PlayerSeasonStats`**: Per-season statistics for players.
    *   `player_id` (FK to Players), `season_id` (PK Part), `team_code` (PK Part)
    *   `gp`, `ppg`, `rpg`, `apg`, `ts_pct`, `vorp`, `ws`, etc.
    *   *Source CSVs:* `Player Per Game.csv`, `Player Totals.csv`, `Advanced.csv`, `Per 36 Minutes.csv`, `Per 100 Poss.csv`, `Player Shooting.csv`, `Player Play By Play.csv`
*   **`TeamSeasonStats`**: Per-season statistics for teams.
    *   `team_code` (PK Part), `season_id` (PK Part)
    *   `wins`, `losses`, `team_totals`, `team_per_game`, `team_per_100_poss`, `opponent_stats`, etc.
    *   *Source CSVs:* `Team Totals.csv`, `Team Stats Per Game.csv`, `Team Stats Per 100 Poss.csv`, `Opponent Totals.csv`, `Opponent Stats Per Game.csv`, `Opponent Stats Per 100 Poss.csv`, `Team Summaries.csv`
*   **`Teams`**: Master list of franchises and their historical team codes.
    *   `franchise_id` (PK): Unique ID for each franchise (e.g., LAL, BRK/NJN unified).
    *   `team_code` (unique), `team_name`, `start_year`, `end_year`.
    *   *Source CSVs:* `team.csv`, `team_details.csv`, `Team Abbrev.csv`, `team_history.csv`, `team_info_common.csv` (and custom mapping if needed for franchise continuity)
*   **`DraftPicks`**: NBA Draft information.
    *   `draft_year` (PK Part), `pick_number` (PK Part)
    *   `player_id` (FK to Players), `team_code` (FK to Teams), `round`, `college`, etc.
    *   *Source CSVs:* `draft_history.csv`, `draft_combine_stats.csv`
*   **`PlayoffStats`**: Player playoff statistics (structured similarly to PlayerSeasonStats).
    *   `player_id` (FK to Players), `season_id` (PK Part)
    *   `gp_playoffs`, `ppg_playoffs`, etc.
    *   *Source CSVs:* (Assumed from BRef structure; not explicitly listed in current `csv/` contents, but will align if available)
*   **`Awards`**: Player awards and honors.
    *   `award_id` (PK), `player_id` (FK to Players), `season_id`, `award_name`
    *   *Source CSVs:* `Player Award Shares.csv`, `All-Star Selections.csv`, `End of Season Teams.csv`, `End of Season Teams (Voting).csv`
*   **`Games`**: Game-level information (if full game logs are included, prioritizing season-level as per PRD).
    *   `game_id` (PK), `season_id`, `home_team`, `away_team`, `date`, etc.
    *   *Source CSVs:* `game.csv`, `game_info.csv`, `game_summary.csv`, `line_score.csv`, `officials.csv`, `play_by_play.csv` (will focus on derived summaries rather than full play-by-play for performance/offline scope)

## 4. Data Ingestion Flow

The data ingestion process prioritizes a one-time load into a persistent DuckDB-WASM database, with a mechanism for manual refresh ([PRD.md:57-59](PRD.md:57-59)).

```mermaid
graph TD
    A[Application Start/First Run] --> B{Persistent DB Found in Browser Storage?};
    B -- No / Manual Refresh Triggered --> C[Fetch All CSV Files from /public/csv/];
    C --> D{Register Each CSV as Virtual File in DuckDB-WASM};
    D --> E[Execute SQL: CREATE TABLE ... AS SELECT * FROM 'virtual_file';];
    E --> F[Apply Schema Adjustments (if any)];
    F --> G[Save Populated DuckDB State to IndexedDB/OPFS];
    G --> H[DuckDB Ready for Queries];
    B -- Yes --> H;
```

**Steps:**
1.  **Application Initialization:** On application load, the `duckdbService` initializes the DuckDB-WASM instance, ideally within a Web Worker to keep the UI responsive [PRD.md:142](PRD.md:142).
2.  **Persistence Check:** The service attempts to load a previously saved DuckDB database from the browser's IndexedDB or Origin Private File System (OPFS) [PRD.md:140](PRD.md:140).
3.  **Initial Load / Refresh Trigger:**
    *   If no saved database is found, or if a user-initiated "Refresh Data" action is triggered, the ingestion process begins.
    *   All raw `.csv` files located in the `/public/csv/` directory are fetched using standard browser `fetch()` API calls [PRD.md:145-150](PRD.md:145-150).
4.  **Virtual File Registration:** Each fetched CSV's content is registered as a virtual in-memory file within the DuckDB-WASM instance using `db.registerFileText(filename, content)`.
5.  **Data Loading:** DuckDB's powerful `CREATE TABLE ... AS SELECT * FROM 'filename';` command is executed for each virtual CSV file. This enables DuckDB to efficiently parse the CSV, infer column types, and load the data into newly created tables [PRD.md:9](PRD.md:9).
6.  **Schema Refinement (Optional):** If specific type casting or minor transformations are required that DuckDB's auto-detection doesn't handle, additional SQL `ALTER TABLE` or `INSERT INTO SELECT` statements can be executed.
7.  **Database Persistence:** Once all data is loaded, the current state of the DuckDB database is saved into IndexedDB/OPFS, ensuring that on subsequent application launches, the data is readily available without needing to re-parse CSVs [PRD.md:140](PRD.md:140), [PRD.md:59](PRD.md:59).

**PapaParse as Fallback:** While DuckDB's native CSV reader is preferred, PapaParse is available as a supplementary tool. It could be used if direct DuckDB CSV reading runs into unforeseen browser sandboxing issues, or for advanced streaming/progress reporting during parsing, or for CSV *export* functionality [PRD.md:151-157](PRD.md:151-157).

## 5. Data Querying Flow

The React frontend directly interacts with the embedded DuckDB-WASM instance for all data retrieval, ensuring a highly responsive and offline experience.

```mermaid
graph TD
    A[React UI Component] --> B{Call useDuckDB Query Hook (e.g., fetchPlayerStats)};
    B --> C[useDuckDB Hook (translates to SQL and calls duckdbService)];
    C --> D[duckdbService (executes SQL query on DuckDB-WASM)];
    D --> E[DuckDB-WASM Web Worker (Executes SQL, fetches from persistent DB)];
    E -- Query Results (Arrow/JSON) --> F[duckdbService (returns data)];
    F --> G[useDuckDB Hook (updates component state)];
    G --> H[React UI Component (re-renders with data)];
```

**Steps:**
1.  **Component Data Request:** A React UI component (e.g., `PlayerDetail.js`) needs to display data. It calls a custom hook (e.g., `useDuckDB()`) or directly invokes a method from `duckdbService.js`.
2.  **SQL Generation:** The hook/service constructs the appropriate SQL query, often parameterized (e.g., `SELECT * FROM PlayerSeasonStats WHERE player_id = ? AND season_id >= ?;`).
3.  **Query Execution:** The SQL query is sent to the DuckDB-WASM instance (running in a Web Worker) via its asynchronous API [PRD.md:104](PRD.md:104).
4.  **Local Data Retrieval:** DuckDB-WASM executes the query against the in-browser database. Its columnar storage and internal optimizations like zone maps ensure efficient, sub-second query execution times even on large datasets [PRD.md:9](PRD.md:9), [PRD.md:115](PRD.md:115).
5.  **Result Handling:** Query results are returned (typically as Arrow tables or JSON objects) to the `duckdbService`, which then relays them back to the React component via the hook.
6.  **UI Update:** The React component receives the data, updates its state, and re-renders to display the fetched statistics. Interactive elements like sorting and filtering on tables directly translate to new DuckDB queries, providing immediate visual feedback and real-time data manipulation [PRD.md:69](PRD.md:69), [PRD.md:110](PRD.md:110).

## Security & Compliance Considerations

*   **Offline First & Privacy:** The client-side, offline-first design inherently enhances privacy as all data resides locally on the user's machine and no data is transmitted to external servers [PRD.md:170](PRD.md:170).
*   **No PII/Sensitive Data:** The application only uses publicly available sports statistics, eliminating concerns related to Personally Identifiable Information (PII) or sensitive data handling.
*   **Input Validation:** While the app is primarily read-only after ingestion, any user inputs (e.g., search queries, filter values) that interact with DuckDB queries should be properly sanitized to prevent potential SQL injection vulnerabilities, even in a local context. This can be mitigated by using parameterized queries.

## Non-Functional Requirements (NFRs) Addressed

*   **Performance:** DuckDB's columnar processing and vectorized execution, even in WASM, ensures rapid query responses ([PRD.md:22-23](PRD.md:22-23), [PRD.md:104](PRR.md:104), [PRD.md:115](PRD.md:115)). Data is loaded once into a persistent DB to avoid repeated CSV parsing [PRD.md:30](PRD.md:30).
*   **Scalability (Data Volume):** DuckDB comfortably handles datasets up to hundreds of MBs or even GBs, utilizing out-of-core processing if needed, making it suitable for decades of stats data [PRD.md:16](PRD.md:16), [PRD.md:115](PRD.md:115).
*   **User Experience:** React provides a responsive and interactive UI. Client-side queries keep the application snappy without network delays [PRD.md:69](PRD.md:69), [PRD.md:110](PRD.md:110).
*   **Offline Functionality:** DuckDB-WASM and local CSV storage enable full functionality without an internet connection [PRD.md:170](PRD.md:170).
*   **Maintainability:** Clear module separation, consistent data schema, and documented flows enhance long-term maintainability.

## Assumptions and Trade-offs

*   **CSV Data Consistency:** Assumes the provided CSV files are well-formed and generally consistent, requiring minimal preprocessing outside of DuckDB's native CSV reader.
*   **Browser Compatibility:** DuckDB-WASM performance and persistence mechanisms (IndexedDB/OPFS) may have slight variations across different browsers. Prioritizing modern browser support.
*   **UI Design Fidelity:** While mirroring BRef's *structure* and *content*, pixel-perfect replication is not a primary goal unless explicitly specified. Webflow integration is optional and serves as a design starting point, with React implementing the dynamic aspects.
*   **Game-Level Detail:** The architecture focuses on season-level and aggregated data; detailed play-by-play or game log views are out of scope to manage data volume and maintain performance, as per [PRD.md:67](PRD.md:67), [PRD.md:130](PRD.md:130).

## API Summary (Internal to Data Layer)

The primary "API" is exposed by the `duckdbService.js` module to the higher-level UI components and hooks.

*   `duckdbService.init(dbPath?: string)`: Initializes the DuckDB-WASM instance. Can specify a path for persistence.
*   `duckdbService.loadCSVs(csvFiles: { name: string, path: string }[]): Promise<void>`: Initiates the bulk ingestion of CSV files into DuckDB tables.
*   `duckdbService.executeQuery(sqlQuery: string, params?: any[]): Promise<any[]>`: Executes an SQL query against the DuckDB instance. Returns results as a plain array of objects or an Arrow table.
*   `duckdbService.exportTableAsCSV(tableName: string): Promise<string>`: (Optional) Exports a given table's content as a CSV string, potentially using PapaParse.

This architecture provides a solid foundation for building a performant, offline-capable, and user-friendly "Local Basketball Reference Stats App" that aligns with the project requirements.