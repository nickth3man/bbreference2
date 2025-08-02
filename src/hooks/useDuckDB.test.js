
// src/hooks/useDuckDB.test.js

import { renderHook, act } from '@testing-library/react';
import { useDuckDB } from './useDuckDB';
import { query as mockQuery } from '../services/duckdbService';

jest.mock('../services/duckdbService');

describe('useDuckDB', () => {
  it('should execute a query and return data', async () => {
    const mockData = [{ id: 1, name: 'test' }];
    mockQuery.mockResolvedValue(mockData);

    const { result, waitForNextUpdate } = renderHook(() => useDuckDB('SELECT * FROM test'));

    expect(result.current.loading).toBe(true);

    await act(async () => {
      await waitForNextUpdate();
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBeNull();
  });

  it('should handle errors', async () => {
    const mockError = new Error('Test Error');
    mockQuery.mockRejectedValue(mockError);

    const { result, waitForNextUpdate } = renderHook(() => useDuckDB('SELECT * FROM test'));

    expect(result.current.loading).toBe(true);

    await act(async () => {
      await waitForNextUpdate();
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.data).toEqual([]);
    expect(result.current.error).toEqual(mockError);
  });
});
