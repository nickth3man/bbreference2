import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { executeQuery } from '../services/duckdbService';

const DraftPage = () => {
  const { year } = useParams();
  const [draftedPlayers, setDraftedPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

  // Re-usable helper functions for formatting headers and values
  const formatHeader = (header) => {
    switch (header) {
      case 'rank': return 'Pk';
      case 'player_name': return 'Player';
      case 'team_code': return 'Tm';
      case 'draft_year': return 'Year';
      case 'round': return 'Rd';
      case 'pick_in_round': return 'OvP';
      case 'college': return 'College';
      case 'career_games': return 'G';
      case 'career_pts': return 'PTS';
      case 'career_trb': return 'TRB';
      case 'career_ast': return 'AST';
      case 'career_ws': return 'WS';
      default: return header.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    }
  };

  const formatValue = (key, value) => {
    const oneDecimalKeys = ['career_pts', 'career_trb', 'career_ast', 'career_ws'];

    if (typeof value === 'number') {
      if (oneDecimalKeys.includes(key)) {
        return value.toFixed(1);
      }
      return value;
    }
    return value;
  };

  useEffect(() => {
    const fetchDraftData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch players drafted in the given year, joining with Players and PlayerCareerInfo
        const query = `
          SELECT
            dh.overall_pick AS rank,
            p.player_name,  -- From consolidated Players table for consistency
            dh.person_id AS player_id, -- player_id for linking
            dh.team_abbreviation AS team_code, -- team_code for linking team season stats
            dh.college AS college,
            dh.round_number AS round,
            dh.round_pick AS pick_in_round,
            pci.G AS career_games,
            pci.PTS AS career_pts,
            pci.TRB AS career_trb,
            pci.AST AS career_ast,
            pci.WS AS career_ws
          FROM DraftHistoryRaw AS dh
          LEFT JOIN Players AS p ON dh.person_id = p.player_id
          LEFT JOIN PlayerCareerInfo AS pci ON dh.person_id = pci.player_id
          WHERE dh.season = CAST('${year}' AS INTEGER)
          ORDER BY dh.overall_pick ASC;
        `;
        const result = await executeQuery(query);
        setDraftedPlayers(result);
      } catch (err) {
        console.error("Error fetching draft data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDraftData();
  }, [year]);

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

  if (loading) return <div>Loading {year} draft data...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>NBA {year} Draft Summary</h1>
      {draftedPlayers.length > 0 ? (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
            <thead>
              <tr>
                {Object.keys(draftedPlayers[0]).filter(key => key !== 'player_id').map((header) => (
                  <th
                    key={header}
                    style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left', cursor: 'pointer' }}
                    onClick={() => requestSort(header)}
                  >
                    {formatHeader(header)}{sortConfig.key === header ? (sortConfig.direction === 'ascending' ? ' ▲' : ' ▼') : ''}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedData(draftedPlayers, sortConfig).map((player, index) => (
                <tr key={player.player_id || index}>
                  {Object.keys(player).filter(key => key !== 'player_id').map((key) => (
                    <td key={key} style={{ border: '1px solid #ddd', padding: '8px' }}>
                      {key === 'player_name' ? (
                        <Link to={`/players/${player.player_id}`}>{player[key]}</Link>
                      ) : key === 'team_code' ? (
                        <Link to={`/teams/${player.team_code}/${year}`}>{player[key]}</Link>
                      ) : (
                        formatValue(key, player[key])
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No draft data available for {year}.</p>
      )}
    </div>
  );
};

export default DraftPage;