
// src/__mocks__/@duckdb/duckdb-wasm.js

export const AsyncDuckDB = jest.fn().mockImplementation(() => ({
  connect: jest.fn().mockResolvedValue({
    query: jest.fn().mockResolvedValue([]),
    close: jest.fn().mockResolvedValue(undefined),
  }),
  flushFiles: jest.fn().mockResolvedValue(undefined),
  dropFiles: jest.fn().mockResolvedValue(undefined),
  registerFileText: jest.fn().mockResolvedValue(undefined),
}));

export const ConsoleLogger = jest.fn();
