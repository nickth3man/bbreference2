import { AsyncDuckDB, createWorker, getJsDelivrBundles } from '@duckdb/duckdb-wasm';
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
        const bundle = await getJsDelivrBundles();
        const worker = await duckdb.createWorker(bundle.mvp.mainWorker);
        db = new AsyncDuckDB(logger, worker);
        await db.instantiate(bundle.mvp.mainModule, bundle.mvp.pthreadWorker);

        // Open a connection to a persistent database
        // 'stats.duckdb' will be saved to IndexedDB in the browser
        await db.open({ path: 'stats.duckdb' });
        conn = await db.connect();

        console.log('DuckDB initialized and connected.');

        // Check if tables already exist to avoid re-ingestion on subsequent loads
        // Expanded check to include more core tables that are always expected if ingestion was successful
        const tableCheckQuery = `
            SELECT COUNT(*) AS count FROM information_schema.tables
            WHERE table_name IN ('Players', 'PlayerSeasonInfo', 'PlayerPerGame', 'TeamSeasonRecords', 'DraftHistory', 'PlayerCareerInfo', 'CommonPlayerInfo', 'Games');
        `;
        const result = await conn.query(tableCheckQuery);
        // Assuming at least one of the major tables should exist if previous ingestion was complete.
        // A count of 0 implies no or incomplete ingestion.
        if (result.toArray()[0].count < 8) { // Adjust count to match the number of tables being checked
            console.log('Tables not found or incomplete. Starting data ingestion...');
            await createTablesAndIngestData();
            console.log('Data ingestion complete.');
        } else {
            console.log('All major tables already exist. Skipping data ingestion.');
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
        // Player Data
        { name: 'Player Directory.csv', tableName: 'PlayerDirectory' }, // player, slug, hof, is_active
        { name: 'common_player_info.csv', tableName: 'CommonPlayerInfo' }, // player_slug, height, weight, position, draft info, etc
        { name: 'Player Career Info.csv', tableName: 'PlayerCareerInfo' }, // career totals
        { name: 'Player Per Game.csv', tableName: 'PlayerPerGame' },
        { name: 'Player Totals.csv', tableName: 'PlayerTotals' },
        { name: 'Advanced.csv', tableName: 'PlayerAdvanced' },
        { name: 'Per 36 Minutes.csv', tableName: 'PlayerPer36Minutes' },
        { name: 'Per 100 Poss.csv', tableName: 'PlayerPer100Poss' },
        { name: 'Player Shooting.csv', tableName: 'PlayerShooting' },
        { name: 'Player Play By Play.csv', tableName: 'PlayerPlayByPlay' },
        { name: 'Player Season Info.csv', tableName: 'PlayerSeasonInfo' },
        { name: 'player.csv', tableName: 'PlayersRaw' }, // This file has 'slug' and 'hof' too

        // Team Data
        { name: 'team_abbrev.csv', tableName: 'TeamAbbrev' }, // Team abbreviation to full name mapping (e.g., BRK -> Brooklyn Nets)
        { name: 'team_details.csv', tableName: 'TeamDetails' }, // More team details (e.g., arena)
        { name: 'team_history.csv', tableName: 'FranchiseMetadata' }, // team_id, city, nickname, year_founded, year_active_till 
        { name: 'Team Summaries.csv', tableName: 'TeamSummaries' }, // Season summaries for teams, including W/L
        { name: 'Team Stats Per Game.csv', tableName: 'TeamPerGameStats' },
        { name: 'Team Totals.csv', tableName: 'TeamTotalsStats' },
        { name: 'Team Stats Per 100 Poss.csv', tableName: 'TeamPer100PossStats' },
        { name: 'Opponent Stats Per Game.csv', tableName: 'OpponentPerGameStats' },
        { name: 'Opponent Totals.csv', tableName: 'OpponentTotalsStats' },
        { name: 'Opponent Stats Per 100 Poss.csv', tableName: 'OpponentPer100PossStats' },
        { name: 'team.csv', tableName: 'TeamIDs' }, // Contains team_id, team_abbreviation, team_name

        // Draft Data
        { name: 'draft_history.csv', tableName: 'DraftHistoryRaw' }, // Raw draft picks
        { name: 'draft_combine_stats.csv', tableName: 'DraftCombineStats' },

        // Playoff & Game Data
        { name: 'game.csv', tableName: 'GamesRaw' }, // Basic game info, including 'season_type'
        { name: 'game_info.csv', tableName: 'GameInfo' }, // More game details (Visitor/Home team/pts)
        { name: 'game_summary.csv', tableName: 'GameSummary' },
        { name: 'line_score.csv', tableName: 'LineScore' },
        { name: 'officials.csv', tableName: 'Officials' },
        { name: 'Player Playoff.csv', tableName: 'PlayerPlayoffStats', optional: true }, // Placeholder if a dedicated playoff file exists


        // Awards data
        { name: 'Player Award Shares.csv', tableName: 'PlayerAwardShares' },
        { name: 'All-Star Selections.csv', tableName: 'AllStarSelections' },
        { name: 'End of Season Teams.csv', tableName: 'EndOfSeasonTeams' }, // All-NBA, All-Defensive
        { name: 'End of Season Teams (Voting).csv', tableName: 'EndOfSeasonTeamsVoting' },
    ];

    for (const file of csvFiles) {
        try {
            console.log(`Fetching ${file.name}...`);
            const response = await fetch(`${VIRTUAL_BASE_PATH}${encodeURIComponent(file.name)}`);
            if (!response.ok) {
                if (file.optional) {
                    console.warn(`Optional file ${file.name} not found, skipping.`);
                    continue;
                }
                throw new Error(`HTTP error! status: ${response.status} for ${file.name}`);
            }
            const csvContent = await response.text();

            console.log(`Registering ${file.name} as virtual file...`);
            await db.registerFileText(file.name, csvContent);

            console.log(`Creating table ${file.tableName} and ingesting data...`);
            let createTableSql = '';

            switch (file.tableName) {
                case 'PlayerDirectory':
                    // This table will be explicitly created as 'Players' later, combining relevant info.
                    // For now, load raw PlayerDirectory.csv.
                    createTableSql = `CREATE OR REPLACE TABLE PlayerDirectory AS SELECT * FROM READ_CSV_AUTO('${file.name}', ALL_VARCHAR=TRUE);`;
                    await conn.query(createTableSql);
                    break;
                case 'CommonPlayerInfo':
                    createTableSql = `
                        CREATE OR REPLACE TABLE CommonPlayerInfo AS
                        SELECT
                            player_slug AS player_id,
                            display_first_last AS full_name,
                            height AS Ht,
                            weight AS Wt,
                            position AS Pos,
                            birthdate AS "Date of Birth",
                            school AS College,
                            CASE
                                WHEN draft_year IS NOT NULL AND draft_year <> '' THEN
                                    CONCAT(CAST(draft_year AS VARCHAR), ', R', CAST(draft_round AS VARCHAR), ', P', CAST(draft_number AS VARCHAR))
                                ELSE NULL
                            END AS Draft
                        FROM "common_player_info.csv";
                    `;
                    await conn.query(createTableSql);
                    break;
                case 'PlayerCareerInfo':
                    createTableSql = `
                        CREATE OR REPLACE TABLE PlayerCareerInfo AS
                        SELECT
                            player_id,
                            player AS Player,
                            num_seasons AS Yrs,
                            first_seas,
                            last_seas,
                            hof AS is_hall_of_famer,
                            G,
                            PTS,
                            TRB,
                            AST,
                            "FG%" AS FG_percent,
                            "eFG%" AS eFG_percent,
                            "FT%" AS FT_percent,
                            "TS%" AS TS_percent,
                            "WS" AS WS
                        FROM "Player Career Info.csv";
                    `;
                    await conn.query(createTableSql);
                    break;
                case 'PlayerPerGame':
const PlayerPerGameSchemaMapping = {
    seas_id: "INTEGER",
    season: "VARCHAR",
    player_id: "VARCHAR",
    player: "VARCHAR",
    birth_year: "VARCHAR",
    pos: "VARCHAR",
    age: "VARCHAR",
    experience: "VARCHAR",
    lg: "VARCHAR",
    tm: "VARCHAR",
    g: "INTEGER",
    gs: "INTEGER",
    mp_per_game: "FLOAT",
    fg_per_game: "FLOAT",
    fga_per_game: "FLOAT",
    fg_percent: "FLOAT",
    x3p_per_game: "FLOAT",
    x3pa_per_game: "FLOAT",
    x3p_percent: "FLOAT",
    x2p_per_game: "FLOAT",
    x2pa_per_game: "FLOAT",
    x2p_percent: "FLOAT",
    e_fg_percent: "FLOAT",
    ft_per_game: "FLOAT",
    fta_per_game: "FLOAT",
    ft_percent: "FLOAT",
    orb_per_game: "FLOAT",
    drb_per_game: "FLOAT",
    trb_per_game: "FLOAT",
    ast_per_game: "FLOAT",
    stl_per_game: "FLOAT",
    blk_per_game: "FLOAT",
    tov_per_game: "FLOAT",
    pf_per_game: "FLOAT",
    pts_per_game: "FLOAT"
};
                    // Explicitly define schema to ensure correct types for numerical stats, and handle header names
                    createTableSql = `
                        CREATE OR REPLACE TABLE PlayerPerGame (
                            seas_id INTEGER,
                            season VARCHAR,
                            player_id VARCHAR,
                            player VARCHAR,
                            birth_year VARCHAR,
                            pos VARCHAR,
                            age VARCHAR,
                            experience VARCHAR,
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
                    `;
                    await conn.query(createTableSql);
                    // Load data, handling potential 'NA' by converting to NULL for numeric types implicitly by DuckDB
                    await conn.query(`INSERT INTO ${file.tableName} SELECT * FROM READ_CSV_AUTO('${file.name}', columns='${Object.keys(PlayerPerGameSchemaMapping).join(',')}', ignore_errors=TRUE);`);
                    break;
                case 'PlayersRaw': // To address player.csv specific structure
                    createTableSql = `CREATE OR REPLACE TABLE ${file.tableName} AS SELECT * FROM READ_CSV_AUTO('${file.name}', ALL_VARCHAR=TRUE);`;
                    await conn.query(createTableSql);
                    break;
                case 'TeamAbbrev':
                     createTableSql = `CREATE OR REPLACE TABLE TeamAbbrev AS SELECT * FROM READ_CSV_AUTO('${file.name}', ALL_VARCHAR=TRUE);`;
                    await conn.query(createTableSql);
                    break;
                case 'FranchiseMetadata':
                     createTableSql = `CREATE OR REPLACE TABLE FranchiseMetadata AS SELECT * FROM READ_CSV_AUTO('${file.name}', ALL_VARCHAR=TRUE);`;
                    await conn.query(createTableSql);
                    break;
                case 'TeamSummaries':
                    createTableSql = `
                        CREATE OR REPLACE TABLE TeamSummaries (
                            Season VARCHAR,
                            Lg VARCHAR,
                            team VARCHAR,
                            abbreviation VARCHAR,
                            playoffs BOOLEAN,
                            age FLOAT,
                            w INTEGER,
                            l INTEGER,
                            pw INTEGER,
                            pl INTEGER,
                            mov FLOAT,
                            sos FLOAT,
                            srs FLOAT,
                            o_rtg FLOAT,
                            d_rtg FLOAT,
                            n_rtg FLOAT,
                            pace FLOAT,
                            f_tr FLOAT,
                            x3p_ar FLOAT,
                            ts_percent FLOAT,
                            e_fg_percent FLOAT,
                            tov_percent FLOAT,
                            orb_percent FLOAT,
                            ft_fga FLOAT,
                            opp_e_fg_percent FLOAT,
                            opp_tov_percent FLOAT,
                            opp_drb_percent FLOAT,
                            opp_ft_fga FLOAT,
                            arena VARCHAR,
                            attend INTEGER,
                            attend_g INTEGER
                        );
                    `;
                    await conn.query(createTableSql);
                    await conn.query(`INSERT INTO ${file.tableName} SELECT * FROM READ_CSV_AUTO('${file.name}', ALL_VARCHAR=TRUE);`); // ALL_VARCHAR=TRUE to handle mixed types and NA
                    break;
                case 'DraftHistoryRaw': // From draft_history.csv
                    createTableSql = `
                        CREATE OR REPLACE TABLE DraftHistory (
                            person_id VARCHAR,
                            player_name VARCHAR,
                            season INTEGER, -- Draft Year
                            round_number INTEGER,
                            round_pick INTEGER,
                            overall_pick INTEGER,
                            draft_type VARCHAR,
                            team_id VARCHAR,
                            team_city VARCHAR,
                            team_name VARCHAR,
                            team_abbreviation VARCHAR,
                            organization VARCHAR,
                            organization_type VARCHAR,
                            player_profile_flag BOOLEAN
                        );
                     `;
                    await conn.query(createTableSql);
                    await conn.query(`INSERT INTO ${file.tableName} SELECT * FROM READ_CSV_AUTO('${file.name}', ALL_VARCHAR=TRUE);`);
                    break;
                case 'GamesRaw': // From game.csv
                    createTableSql = `
                        CREATE OR REPLACE TABLE Games (
                            season_id INTEGER,
                            team_id_home VARCHAR,
                            team_abbreviation_home VARCHAR,
                            team_name_home VARCHAR,
                            game_id VARCHAR,
                            game_date DATE,
                            matchup_home VARCHAR,
                            wl_home VARCHAR,
                            min INTEGER,
                            fgm_home INTEGER,
                            fga_home INTEGER,
                            fg_pct_home FLOAT,
                            fg3m_home INTEGER,
                            fg3a_home INTEGER,
                            fg3_pct_home FLOAT,
                            ftm_home INTEGER,
                            fta_home INTEGER,
                            ft_pct_home FLOAT,
                            oreb_home INTEGER,
                            dreb_home INTEGER,
                            reb_home INTEGER,
                            ast_home INTEGER,
                            stl_home INTEGER,
                            blk_home INTEGER,
                            tov_home INTEGER,
                            pf_home INTEGER,
                            pts_home INTEGER,
                            plus_minus_home INTEGER,
                            video_available_home BOOLEAN,
                            team_id_away VARCHAR,
                            team_abbreviation_away VARCHAR,
                            team_name_away VARCHAR,
                            matchup_away VARCHAR,
                            wl_away VARCHAR,
                            fgm_away INTEGER,
                            fga_away INTEGER,
                            fg_pct_away FLOAT,
                            fg3m_away INTEGER,
                            fg3a_away INTEGER,
                            fg3_pct_away FLOAT,
                            ftm_away INTEGER,
                            fta_away INTEGER,
                            ft_pct_away FLOAT,
                            oreb_away INTEGER,
                            dreb_away INTEGER,
                            reb_away INTEGER,
                            ast_away INTEGER,
                            stl_away INTEGER,
                            blk_away INTEGER,
                            tov_away INTEGER,
                            pf_away INTEGER,
                            pts_away INTEGER,
                            plus_minus_away INTEGER,
                            video_available_away BOOLEAN,
                            season_type VARCHAR -- This is crucial for distinguishing playoffs
                        );
                    `;
                    await conn.query(createTableSql);
                    await conn.query(`INSERT INTO ${file.tableName} SELECT * FROM READ_CSV_AUTO('${file.name}', ALL_VARCHAR=TRUE);`);
                    break;
                case 'TeamIDs':
                    createTableSql = `CREATE OR REPLACE TABLE TeamIDs AS SELECT * FROM READ_CSV_AUTO('${file.name}', ALL_VARCHAR=TRUE);`;
                    await conn.query(createTableSql);
                    break;
                case 'TeamDetails':
                    createTableSql = `CREATE OR REPLACE TABLE TeamDetails AS SELECT * FROM READ_CSV_AUTO('${file.name}', ALL_VARCHAR=TRUE);`;
                    await conn.query(createTableSql);
                    break;
                case 'GameInfo':
                    createTableSql = `CREATE OR REPLACE TABLE GameInfo AS SELECT * FROM READ_CSV_AUTO('${file.name}', ALL_VARCHAR=TRUE);`;
                    await conn.query(createTableSql);
                    break;
                default:
                    // For all other files, use AUTO_DETECT and load directly
                    createTableSql = `CREATE OR REPLACE TABLE ${file.tableName} AS SELECT * FROM READ_CSV_AUTO('${file.name}', ALL_VARCHAR=TRUE);`;
                    await conn.query(createTableSql);
                    console.log(`Table ${file.tableName} created and data ingested using AUTO_DETECT.`);
            }

            console.log(`Data from ${file.name} ingested into ${file.tableName}.`);

        } catch (error) {
            console.error(`Error processing ${file.name}:`, error);
        } finally {
            // No unregistering needed for persistence unless explicitly dropping tables.
        }
    }

    // After all raw CSVs are loaded, create refined/joined tables for easier querying
    console.log('Creating consolidated Players table...');
    await conn.query(`
        CREATE OR REPLACE TABLE Players AS
        SELECT
            pd.slug AS player_id,
            pd.player AS player_name,
            pd.hof AS is_hall_of_famer,
            pd.is_active,
            cpi.Pos AS position,
            cpi.Ht AS height,
            cpi.Wt AS weight,
            cpi."Date of Birth" AS birth_date,
            cpi.College,
            cpi.Draft
        FROM PlayerDirectory AS pd
        LEFT JOIN CommonPlayerInfo AS cpi ON pd.slug = cpi.player_id;
    `);
    console.log('Consolidated Players table created.');

    console.log('Creating consolidated TeamSeasonRecords table...');
    await conn.query(`
        CREATE OR REPLACE TABLE TeamSeasonRecords AS
        SELECT
            ts.Season AS season_id,
            ts.abbreviation AS team_code,
            ts.team AS team_name,
            ts.w AS wins,
            ts.l AS losses,
            ts."W/L%" AS win_loss_percentage,
            ts.playoffs AS playoff_status,
            ts.o_rtg AS offensive_rating,
            ts.d_rtg AS defensive_rating,
            ts.n_rtg AS net_rating,
            ts.Mov AS margin_of_victory,
            ts.SRS AS simple_rating_system,
            ts.Pace AS pace,
            ts."Coaches" AS coaches,
            ts."Top WS" AS top_ws_player,
            ts.PTS AS total_pts,
            ts.TRB AS total_trb,
            ts.AST AS total_ast
        FROM TeamSummaries AS ts;
    `);
    console.log('Consolidated TeamSeasonRecords table created.');

    console.log('Creating indexes for faster queries...');
    await conn.query(`CREATE INDEX idx_player_id ON Players (player_id);`);
    await conn.query(`CREATE INDEX idx_team_season ON TeamSeasonRecords (team_code, season_id);`);
    await conn.query(`CREATE INDEX idx_player_season ON PlayerPerGame (player_id, season);`);
    console.log('Indexes created.');
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