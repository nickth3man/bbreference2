import { AsyncDuckDB } from '@duckdb/duckdb-wasm';
// src/services/__mocks__/duckdbService.js
// Align mock to tests in src/services/duckdbService.test.js.
// Tests create new AsyncDuckDB().connect() and expect our query() to use the same connection.

// Shared connection used by both the test's AsyncDuckDB and our service mock
export const __mockConnection = {
  query: jest.fn(async (_sql) => {
    // Return a simple array; tests assert that query was invoked and may inject errors.
    return [];
  }),
  close: jest.fn(async () => {})
};

let __connectPatched = false;

export const initDB = jest.fn(async () => {
  // Patch the AsyncDuckDB prototype so any instance in tests returns our shared connection.
  if (!__connectPatched && AsyncDuckDB && AsyncDuckDB.prototype) {
    AsyncDuckDB.prototype.connect = jest.fn(async () => __mockConnection);
    __connectPatched = true;
  }
  // No further init needed for tests.
});

// Service-level query uses the same connect() path so expectations on mockConnection.query hold.
export const query = jest.fn(async (sql) => {
  let conn;
  try {
    const db = new AsyncDuckDB();
    conn = await db.connect();
    return await conn.query(sql);
  } catch (err) {
    // Keep error message shape as asserted by tests
    // eslint-disable-next-line no-console
    console.error(`Error executing query: ${sql}`, err);
    throw err;
  } finally {
    if (conn && typeof conn.close === 'function') {
      await conn.close();
    }
  }
});

export default {
  initDB,
  query
};
