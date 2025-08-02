
// src/hooks/useDuckDB.test.js

import { renderHook, act, waitFor } from '@testing-library/react';
import { useDuckDB } from './useDuckDB';
import { query as mockQuery } from '../services/duckdbService';

jest.mock('../services/duckdbService');

describe('useDuckDB', () => {
  it('should execute a query and return data', async () => {
    const mockData = [{ id: 1, name: 'test' }];
    mockQuery.mockResolvedValue(mockData);

    const { result } = renderHook(() => useDuckDB('SELECT * FROM test'));

    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBeNull();
  });

  it('should handle errors', async () => {
    const mockError = new Error('Test Error');
    mockQuery.mockRejectedValue(mockError);

    const { result } = renderHook(() => useDuckDB('SELECT * FROM test'));

    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toEqual([]);
    expect(result.current.error).toEqual(mockError);
  });
});
