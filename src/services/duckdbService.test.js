jest.mock('./duckdbService');

// src/services/duckdbService.test.js

import { initializeDuckDB, executeQuery } from './duckdbService';
import { AsyncDuckDB } from '@duckdb/duckdb-wasm';

jest.mock('@duckdb/duckdb-wasm');

global.URL.createObjectURL = jest.fn();

describe('duckdbService', () => {
  let mockDb;

  beforeEach(async () => {
    mockDb = new AsyncDuckDB();
    await initializeDuckDB();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize the database', () => {
    expect(AsyncDuckDB).toHaveBeenCalledTimes(1);
  });

  it('should execute a query', async () => {
    const mockConnection = await mockDb.connect();
    await executeQuery('SELECT * FROM test');
    expect(mockConnection.query).toHaveBeenCalledWith('SELECT * FROM test');
  });

  it('should handle query errors', async () => {
    const mockConnection = await mockDb.connect();
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockConnection.query.mockRejectedValue(new Error('Test Error'));

    await expect(executeQuery('SELECT * FROM test')).rejects.toThrow('Test Error');
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error executing query: SELECT * FROM test', new Error('Test Error'));

    consoleErrorSpy.mockRestore();
  });
});
