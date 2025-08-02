/**
 * Custom React hook for DuckDB data fetching
 * 
 * This hook provides a clean interface for components to fetch data from DuckDB
 * while managing loading states, errors, and caching.
 */

import { useState, useEffect } from 'react';
import { query } from '../services/duckdbService';

export const useDuckDB = (sql) => {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await query(sql);
        setData(result);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [sql]);

  return { data, error, loading };
};

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
