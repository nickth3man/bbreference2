import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { executeQuery } from '../services/duckdbService';

const LeadersPage = () => {
  const [leaders, setLeaders] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeStat, setActiveStat] = useState('pts_per_game'); // Default to Points Per Game
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

  // A list of statistical categories to display
  // Use column names from PlayerPerGame table directly for stat.key
  const statCategories = [
    { key: 'pts_per_game', name: 'Points' },
    { key: 'trb_per_game', name: 'Rebounds' },
    { key: 'ast_per_game', name: 'Assists' },
    { key: 'stl_per_game', name: 'Steals' },
    { key: 'blk_per_game', name: 'Blocks' },
    { key: 'mp_per_game', name: 'Minutes' },
    { key: 'fg_percent', name: 'FG%' },
    { key: 'x3p_percent', name: '3P%' },
    { key: 'ft_percent', name: 'FT%' },
  ];

  // Re-usable helper functions for formatting headers and values
  const formatHeader = (header) => {
    switch (header) {
      case 'player_name': return 'Player';
      case 'team_code': return 'Tm';
      case 'stat_value': return activeStat.replace(/_per_game/g, '').replace(/_percent/g, '%').replace(/x(\d)p/g, '$1P').toUpperCase();
      default: return header.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    }
  };

  const formatValue = (key, value) => {
    const percentageKeys = ['fg_percent', 'x3p_percent', 'ft_percent'];
    const oneDecimalKeys = ['pts_per_game', 'trb_per_game', 'ast_per_game', 'stl_per_game', 'blk_per_game', 'mp_per_game'];

    if (typeof value === 'number') {
      if (percentageKeys.includes(key) || key === 'stat_value' && percentageKeys.includes(activeStat)) {
        return value.toFixed(3);
      }
      if (oneDecimalKeys.includes(key) || key === 'stat_value' && oneDecimalKeys.includes(activeStat)) {
        return value.toFixed(1);
      }
      return value;
    }
    return value;
  };

  useEffect(() => {
    const fetchLeadersData = async () => {
      try {
        setLoading(true);
        setError(null);
        let allLeaders = {};

        // Determine the latest season available from PlayerPerGame
        const latestSeasonQuery = `SELECT MAX(CAST(season AS INTEGER)) AS latest_season FROM PlayerPerGame;`;
        const latestSeasonResult = await executeQuery(latestSeasonQuery);
        const season = latestSeasonResult[0]?.latest_season || 2023; // Fallback to 2023

        for (const stat of statCategories) {
          const query = `
            SELECT
              ppg.player_id,
              p.player_name,
              ppg."${stat.key}" AS stat_value,
              ppg.season,
              ppg.tm AS team_code
            FROM PlayerPerGame AS ppg
            JOIN Players AS p ON ppg.player_id = p.player_id
            WHERE ppg.season = '${season}' AND ppg.lg = 'NBA' AND ppg.tm <> 'TOT' AND ppg.g > 0
            ORDER BY stat_value DESC
            LIMIT 20;
          `;
          const result = await executeQuery(query);
          allLeaders[stat.key] = result;
        }
        setLeaders(allLeaders);
      } catch (err) {
        console.error("Error fetching leaders data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLeadersData();
  }, [activeStat]); // Re-fetch when activeStat changes, but ensure this is just for sorting or category change, not initial load

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedData = (data, sortConf) => {
    if (!data || data.length === 0) return [];
    if (!sortConf.key) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortConf.key];
      const bValue = b[sortConf.key];

      if (aValue === null || aValue === undefined) return sortConf.direction === 'ascending' ? 1 : -1;
      if (bValue === null || bValue === undefined) return sortConf.direction === 'ascending' ? -1 : 1;

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConf.direction === 'ascending'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      } else {
        return sortConf.direction === 'ascending'
          ? aValue - bValue
          : bValue - aValue;
      }
    });
  };

  if (loading) return <div>Loading league leaders...</div>;
  if (error) return <div>Error: {error}</div>;

  const currentLeaders = leaders[activeStat] || [];

  return (
    <div>
      <h1>NBA League Leaders (Season: {currentLeaders[0]?.season || 'N/A'})</h1>

      <div style={{ marginBottom: '20px' }}>
        {statCategories.map((stat) => (
          <button
            key={stat.key}
            onClick={() => { setActiveStat(stat.key); setSortConfig({ key: 'stat_value', direction: 'descending' }); }} // Sort by stat value by default
            style={{
              marginRight: '10px',
              padding: '8px 15px',
              cursor: 'pointer',
              fontWeight: activeStat === stat.key ? 'bold' : 'normal',
              backgroundColor: activeStat === stat.key ? '#007bff' : '#f0f0f0',
              color: activeStat === stat.key ? 'white' : 'black',
              border: '1px solid #ddd',
              borderRadius: '5px',
            }}
          >
            {stat.name}
          </button>
        ))}
      </div>

      {currentLeaders.length > 0 ? (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
            <thead>
              <tr>
                <th
                  style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left', cursor: 'pointer' }}
                  onClick={() => requestSort('player_name')}
                >
                  {formatHeader('player_name')} {sortConfig.key === 'player_name' ? (sortConfig.direction === 'ascending' ? ' ▲' : ' ▼') : ''}
                </th>
                <th
                  style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left', cursor: 'pointer' }}
                  onClick={() => requestSort('team_code')}
                >
                  {formatHeader('team_code')} {sortConfig.key === 'team_code' ? (sortConfig.direction === 'ascending' ? ' ▲' : ' ▼') : ''}
                </th>
                <th
                  style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left', cursor: 'pointer' }}
                  onClick={() => requestSort('stat_value')}
                >
                  {formatHeader('stat_value')} {sortConfig.key === 'stat_value' ? (sortConfig.direction === 'ascending' ? ' ▲' : ' ▼') : ''}
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedData(currentLeaders, sortConfig).map((leader, index) => (
                <tr key={leader.player_id}>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                    <Link to={`/players/${leader.player_id}`}>{leader.player_name}</Link>
                  </td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                    <Link to={`/teams/${leader.team_code}/${leader.season}`}>{leader.team_code}</Link>
                  </td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                    {formatValue('stat_value', leader.stat_value)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No leaders available for this category.</p>
      )}
    </div>
  );
};

export default LeadersPage;