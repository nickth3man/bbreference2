import { AsyncDuckDB, DuckDBConnection, createDuckDB } from '@duckdb/duckdb-wasm';
import duckdb_wasm from '@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm';
import duckdb_wasm_next from '@duckdb/duckdb-wasm/dist/duckdb-eh.wasm';

const VIRTUAL_BASE_PATH = '/csv/'; // Base path for virtual CSV files

const DUCKDB_BUNDLES = {
    mvp: {
        mainModule: duckdb_wasm,
        mainWorker: new URL('@duckdb/duckdb-wasm/dist/duckdb-browser-mvp.worker.js', import.meta.url).toString(),
    },
    eh: {
        mainModule: duckdb_wasm_next,
        mainWorker: new URL('@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js', import.meta.url).toString(),
    },
};

let db = null;
let conn = null;

/**
 * Initializes the DuckDB-WASM database in a Web Worker, ensuring persistence.
 */
export async function initializeDuckDB() {
    try {
        if (db) {
            console.log('DuckDB already initialized.');
            return;
        }

        const logger = {
            log: (logged_msg) => console.log(logged_msg),
            error: (error_msg) => console.error(error_msg),
        };

        // Create a new DuckDB instance
        const bundle = await createDuckDB(DUCKDB_BUNDLES);
        const worker = new Worker(bundle.mainWorker);
        db = new AsyncDuckDB(logger, worker);
        await db.instantiate(bundle.mainModule, bundle.pthreadWorker);

        // Open a connection to a persistent database
        // 'stats.duckdb' will be saved to IndexedDB in the browser
        await db.open({ path: 'stats.duckdb' });
        conn = await db.connect();

        console.log('DuckDB initialized and connected.');

        // Check if tables already exist to avoid re-ingestion on subsequent loads
        const tableCheckQuery = `
            SELECT COUNT(*) AS count FROM information_schema.tables
            WHERE table_name IN ('Players', 'PlayerSeasonInfo', 'PlayerPerGame');
        `;
        const result = await conn.query(tableCheckQuery);
        if (result.toArray()[0].count === 0) {
            console.log('Tables not found. Starting data ingestion...');
            await createTablesAndIngestData();
            console.log('Data ingestion complete.');
        } else {
            console.log('Tables already exist. Skipping data ingestion.');
        }

    } catch (e) {
        console.error('Failed to initialize DuckDB:', e);
    }
}

/**
 * Creates tables and ingests data from CSV files into DuckDB.
 * This function handles fetching CSVs and loading them into respective tables.
 */
async function createTablesAndIngestData() {
    const csvFiles = [
        { name: 'player.csv', tableName: 'Players' },
        { name: 'Player Season Info.csv', tableName: 'PlayerSeasonInfo' },
        { name: 'Player Per Game.csv', tableName: 'PlayerPerGame' },
        // Add other CSV files here as needed
        // { name: 'Team.csv', tableName: 'Teams' },
        // { name: 'Player Award Shares.csv', tableName: 'Awards' },
    ];

    for (const file of csvFiles) {
        try {
            console.log(`Fetching ${file.name}...`);
            const response = await fetch(`${VIRTUAL_BASE_PATH}${encodeURIComponent(file.name)}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const csvContent = await response.text();

            console.log(`Registering ${file.name} as virtual file...`);
            await db.registerFileText(file.name, csvContent);

            console.log(`Creating table ${file.tableName} and ingesting data...`);
            let createTableSql = '';

            // Handle schema definition explicitly
            switch (file.tableName) {
                case 'Players':
                    createTableSql = `
                        CREATE TABLE Players (
                            id INTEGER PRIMARY KEY,
                            full_name VARCHAR,
                            first_name VARCHAR,
                            last_name VARCHAR,
                            is_active INTEGER
                        );
                    `;
                    break;
                case 'PlayerSeasonInfo':
                    createTableSql = `
                        CREATE TABLE PlayerSeasonInfo (
                            season INTEGER,
                            seas_id INTEGER,
                            player_id INTEGER,
                            player VARCHAR,
                            birth_year VARCHAR, -- Can be 'NA'
                            pos VARCHAR,
                            age INTEGER,
                            lg VARCHAR,
                            tm VARCHAR,
                            experience INTEGER
                        );
                        -- Future: Add PRIMARY KEY (seas_id, player_id, tm) and FOREIGN KEY (player_id) REFERENCES Players(id)
                    `;
                    break;
                 case 'PlayerPerGame':
                    createTableSql = `
                        CREATE TABLE PlayerPerGame (
                            seas_id INTEGER,
                            season INTEGER,
                            player_id INTEGER,
                            player VARCHAR,
                            birth_year VARCHAR,
                            pos VARCHAR,
                            age INTEGER,
                            experience INTEGER,
                            lg VARCHAR,
                            tm VARCHAR,
                            g INTEGER,
                            gs INTEGER,
                            mp_per_game FLOAT,
                            fg_per_game FLOAT,
                            fga_per_game FLOAT,
                            fg_percent FLOAT,
                            x3p_per_game FLOAT,
                            x3pa_per_game FLOAT,
                            x3p_percent FLOAT,
                            x2p_per_game FLOAT,
                            x2pa_per_game FLOAT,
                            x2p_percent FLOAT,
                            e_fg_percent FLOAT,
                            ft_per_game FLOAT,
                            fta_per_game FLOAT,
                            ft_percent FLOAT,
                            orb_per_game FLOAT,
                            drb_per_game FLOAT,
                            trb_per_game FLOAT,
                            ast_per_game FLOAT,
                            stl_per_game FLOAT,
                            blk_per_game FLOAT,
                            tov_per_game FLOAT,
                            pf_per_game FLOAT,
                            pts_per_game FLOAT
                        );
                        -- Future: Add PRIMARY KEY (seas_id, player_id, tm) and FOREIGN KEYs
                    `;
                    break;
                default:
                    console.warn(`No explicit schema defined for ${file.tableName}. Using AUTO_DETECT.`);
                    createTableSql = `CREATE TABLE ${file.tableName} AS SELECT * FROM '${file.name}';`;
            }

            // Execute the CREATE TABLE statement first
            await conn.query(createTableSql);

            // Then load data into the table. DuckDB's CSV reader is robust.
            // If explicit schema was defined, COPY INTO is better. If auto-detect, AS SELECT * FROM 'file'
            // For now, since we created the table explicitly, we can use COPY.
            // However, for files with 'NA' or missing values, 'READ_CSV_AUTO' is often more forgiving.
            // I will use INSERT INTO SELECT because it allows specifying column names explicitly or relying on order,
            // and READ_CSV_AUTO allows for flexible type inference and handling of missing values (like 'NA').
            await conn.query(`INSERT INTO ${file.tableName} SELECT * FROM READ_CSV_AUTO('${file.name}', ALL_VARCHAR=TRUE);`);
            // Setting ALL_VARCHAR to TRUE initially and then casting may offer more flexibility for imperfect data.
            // For now, given the explicit schema, rely on DuckDB's type coercion but keep an eye on 'NA's.

            console.log(`Data from ${file.name} ingested into ${file.tableName}.`);

            // This ensures persistence immediately after ingestion
            // The db.open({path: 'stats.duckdb'}) handles saving/loading
            // No explicit save command is usually needed if using a persistent path with `open`.

        } catch (error) {
            console.error(`Error processing ${file.name}:`, error);
        } finally {
            // Unregistering the file after ingestion can save memory if it's not needed as a virtual file anymore
            // but might be useful to keep if queries directly reference the virtual file later.
            // For now, keep it registered as duckdb doesn't directly remove the underlying data table on unregister
            // unless the database connection is closed or the table dropped.
            // await db.unregisterFile(file.name);
        }
    }
}

/**
 * Executes an SQL query against the DuckDB instance.
 * @param {string} sqlQuery - The SQL query to execute.
 * @param {Array} params - Optional parameters for the query.
 * @returns {Promise<Array<Object>>} - The query results as an array of objects.
 */
export async function executeQuery(sqlQuery, params = []) {
    if (!conn) {
        console.error('DuckDB connection not established.');
        return [];
    }
    try {
        // DuckDB-WASM's query method returns an Arrow table by default.
        // .toArray() converts it to an array of JavaScript objects.
        const result = await conn.query(sqlQuery, params);
        return result.toArray();
    } catch (error) {
        console.error('Error executing query:', error);
        return [];
    }
}

// Ensure the db and conn are accessible, perhaps through getters if direct export is problematic
export { db, conn };