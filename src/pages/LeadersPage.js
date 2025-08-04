import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '../hooks/useQuery';

const LeadersPage = () => {
  const [activeStat, setActiveStat] = useState('pts_per_game'); // Default to Points Per Game
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

  const { data: currentLeaders, loading, error } = useQuery(`
    SELECT
      ppg.player_id,
      p.player_name,
      ppg."${activeStat}" AS stat_value,
      ppg.season,
      ppg.tm AS team_code
    FROM PlayerPerGame AS ppg
    JOIN Players AS p ON ppg.player_id = p.player_id
    WHERE ppg.season = (SELECT MAX(CAST(season AS INTEGER)) FROM PlayerPerGame) AND ppg.lg = 'NBA' AND ppg.tm <> 'TOT' AND ppg.g > 0
    ORDER BY stat_value DESC
    LIMIT 20;
  `);

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
                <th>
                  Player
                </th>
                <th>
                  Tm
                </th>
                <th>
                  {activeStat.replace(/_per_game/g, '').replace(/_percent/g, '%').replace(/x(\d)p/g, '$1P').toUpperCase()}
                </th>
              </tr>
            </thead>
            <tbody>
              {currentLeaders.map((leader, index) => (
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