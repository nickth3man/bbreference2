/**
 * Custom React hook for DuckDB data fetching
 * 
 * This hook provides a clean interface for components to fetch data from DuckDB
 * while managing loading states, errors, and caching.
 */

import { useState, useEffect, useCallback } from 'react';
import { duckdbService } from '../services/duckdbService';

/**
 * Hook for executing DuckDB queries with state management
 * @param {string} initialQuery - Initial SQL query to execute
 * @param {Object} initialParams - Initial query parameters
 * @param {boolean} executeOnMount - Whether to execute query on component mount
 * @returns {Object} Query state and execution function
 */
export function useDuckDB(initialQuery = null, initialParams = {}, executeOnMount = true) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState(initialQuery);
  const [params, setParams] = useState(initialParams);

  const executeQuery = useCallback(async (sqlQuery = query, queryParams = params) => {
    if (!sqlQuery) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await duckdbService.executeQuery(sqlQuery, queryParams);
      setData(result);
    } catch (err) {
      setError(err.message || 'An error occurred while executing the query');
      console.error('DuckDB query error:', err);
    } finally {
      setLoading(false);
    }
  }, [query, params]);

  useEffect(() => {
    if (executeOnMount && query) {
      executeQuery();
    }
  }, [executeOnMount, query, executeQuery]);

  const refetch = useCallback(() => {
    executeQuery();
  }, [executeQuery]);

  const updateQuery = useCallback((newQuery, newParams = {}) => {
    setQuery(newQuery);
    setParams(newParams);
  }, []);

  return {
    data,
    loading,
    error,
    executeQuery,
    refetch,
    updateQuery,
    query,
    params
  };
}

/**
 * Hook for fetching player statistics
 * @param {string} playerId - Player ID
 * @param {number} season - Optional season filter
 * @returns {Object} Player stats data and state
 */
export function usePlayerStats(playerId, season = null) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPlayerStats = useCallback(async () => {
    if (!playerId) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await duckdbService.getPlayerStats(playerId, season);
      setData(result);
    } catch (err) {
      setError(err.message || 'Failed to fetch player statistics');
      console.error('Player stats error:', err);
    } finally {
      setLoading(false);
    }
  }, [playerId, season]);

  useEffect(() => {
    fetchPlayerStats();
  }, [fetchPlayerStats]);

  return {
    data,
    loading,
    error,
    refetch: fetchPlayerStats
  };
}

/**
 * Hook for fetching team statistics
 * @param {string} teamId - Team ID
 * @param {number} season - Optional season filter
 * @returns {Object} Team stats data and state
 */
export function useTeamStats(teamId, season = null) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTeamStats = useCallback(async () => {
    if (!teamId) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await duckdbService.getTeamStats(teamId, season);
      setData(result);
    } catch (err) {
      setError(err.message || 'Failed to fetch team statistics');
      console.error('Team stats error:', err);
    } finally {
      setLoading(false);
    }
  }, [teamId, season]);

  useEffect(() => {
    fetchTeamStats();
  }, [fetchTeamStats]);

  return {
    data,
    loading,
    error,
    refetch: fetchTeamStats
  };
}

/**
 * Hook for searching players by name or other criteria
 * @param {string} searchTerm - Search term
 * @param {Object} filters - Additional filters
 * @returns {Object} Search results and state
 */
export function usePlayerSearch(searchTerm = '', filters = {}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchPlayers = useCallback(async () => {
    if (!searchTerm || searchTerm.length < 2) {
      setData([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let sql = `
        SELECT DISTINCT 
          p.player_id,
          p.name,
          p.position,
          MIN(pss.season) as first_season,
          MAX(pss.season) as last_season,
          COUNT(DISTINCT pss.season) as seasons_played
        FROM players p
        LEFT JOIN player_season_stats pss ON p.player_id = pss.player_id
        WHERE p.name ILIKE ?
      `;

      const params = [`%${searchTerm}%`];

      // Add filters if provided
      if (filters.position) {
        sql += ' AND p.position = ?';
        params.push(filters.position);
      }

      if (filters.minSeason) {
        sql += ' AND pss.season >= ?';
        params.push(filters.minSeason);
      }

      if (filters.maxSeason) {
        sql += ' AND pss.season <= ?';
        params.push(filters.maxSeason);
      }

      sql += `
        GROUP BY p.player_id, p.name, p.position
        ORDER BY p.name
        LIMIT 50
      `;

      const result = await duckdbService.executeQuery(sql, params);
      setData(result);
    } catch (err) {
      setError(err.message || 'Failed to search players');
      console.error('Player search error:', err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filters]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchPlayers();
    }, 300); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [searchPlayers]);

  return {
    data,
    loading,
    error,
    refetch: searchPlayers
  };
}
