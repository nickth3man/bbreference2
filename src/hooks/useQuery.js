import { useState, useEffect, useCallback, useMemo } from 'react';
import { executeQuery } from '../services/duckdbService';

/**
 * A custom React hook to execute a SQL query against DuckDB and manage its state.
 * It handles data fetching, loading and error states, and dynamic sorting.
 * 
 * @param {string} baseSql The base SQL query to execute. The hook will dynamically add ORDER BY clauses.
 * @param {Array} params Optional parameters for the SQL query to prevent SQL injection.
 * @returns {{data: Array, loading: boolean, error: Error|null, sortConfig: {key: string|null, direction: string}, requestSort: Function}}
 * An object containing the query result, loading state, error state, the current sort configuration, 
 * and a function to request a new sort.
 */
// Define allowed sortable columns for security
const ALLOWED_SORT_COLUMNS = [
  'season', 'lg', 'tm', 'pos', 'age', 'g', 'gs', 'mp', 'fg', 'fga', 'fg_pct', 
  '3p', '3pa', '3p_pct', '2p', '2pa', '2p_pct', 'e_fg_percent', 'ft', 'fta', 'ft_pct',
  'orb', 'drb', 'trb', 'ast', 'stl', 'blk', 'tov', 'pf', 'pts',
  'per', 'ts_pct', '3p_ar', 'ft_ar', 'orb_pct', 'drb_pct', 'trb_pct',
  'ast_pct', 'stl_pct', 'blk_pct', 'tov_pct', 'usg_pct', 'ows', 'dws',
  'ws', 'ws_per_48', 'obpm', 'dbpm', 'bpm', 'vorp', 'player', 'player_name',
  'team_name', 'team_code', 'wins', 'losses', 'win_loss_percentage',
  'offensive_rating', 'defensive_rating', 'net_rating', 'pace', 'srs',
  'draft_year', 'round_number', 'overall_pick', 'college', 'height', 'weight'
];

export const useQuery = (baseSql, params = []) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

  // Memoize params to avoid unnecessary re-renders
  const memoizedParams = useMemo(() => params, [JSON.stringify(params)]);

  /**
   * A memoized callback to request a sort change. Toggles direction if the same key is requested again.
   * Only allows sorting on approved columns for security.
   * @param {string} key The key of the column to sort by.
   */
  const requestSort = useCallback((key) => {
    // Validate against allow-list
    if (!ALLOWED_SORT_COLUMNS.includes(key)) {
      console.warn(`Sorting not allowed on column: ${key}`);
      return;
    }
    
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  }, [sortConfig]);

  useEffect(() => {
    const runQuery = async () => {
      if (!baseSql) {
        setLoading(false);
        setData([]);
        return;
      }

      let finalSql = baseSql;
      if (sortConfig.key && ALLOWED_SORT_COLUMNS.includes(sortConfig.key)) {
        // Use allow-list validation instead of regex sanitization
        const safeSortKey = `"${sortConfig.key}"`;
        finalSql = `${baseSql} ORDER BY ${safeSortKey} ${sortConfig.direction === 'ascending' ? 'ASC' : 'DESC'}`;
      }

      try {
        setLoading(true);
        setError(null);
        const result = await executeQuery(finalSql, memoizedParams);
        setData(result);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    runQuery();
  }, [baseSql, memoizedParams, sortConfig]);

  return { data, loading, error, sortConfig, requestSort };
};
