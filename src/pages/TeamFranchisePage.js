import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { executeQuery } from '../services/duckdbService';

const TeamFranchisePage = () => {
  const { teamId } = useParams(); // teamId is the team abbreviation (e.g., 'LAL')
  const [franchiseInfo, setFranchiseInfo] = useState(null);
  const [seasonHistory, setSeasonHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

  useEffect(() => {
    const fetchFranchiseData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch franchise info from FranchiseMetadata and TeamIDs
        const franchiseInfoQuery = `
          SELECT
            ti.team_name AS team_name,
            fm.year_founded AS start_year,
            fm.year_active_till AS end_year
          FROM TeamIDs AS ti
          JOIN FranchiseMetadata AS fm ON ti.team_id = fm.team_id
          WHERE ti.team_abbreviation = '${teamId}';
        `;
        const franchiseInfoResult = await executeQuery(franchiseInfoQuery);
        setFranchiseInfo(franchiseInfoResult.length > 0 ? franchiseInfoResult[0] : null);

        // Fetch season history for the franchise from the consolidated TeamSeasonRecords table
        const seasonHistoryQuery = `
          SELECT
            season_id,
            team_code,
            team_name,
            wins,
            losses
          FROM TeamSeasonRecords
          WHERE team_code = '${teamId}'
          ORDER BY CAST(season_id AS INTEGER) ASC;
        `;
        const seasonHistoryResult = await executeQuery(seasonHistoryQuery);
        setSeasonHistory(seasonHistoryResult);

      } catch (err) {
        console.error("Error fetching team franchise data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFranchiseData();
  }, [teamId]);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedData = (data) => {
    if (!data || data.length === 0) return [];
    if (!sortConfig.key) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue === null || aValue === undefined) return sortConfig.direction === 'ascending' ? 1 : -1;
      if (bValue === null || bValue === undefined) return sortConfig.direction === 'ascending' ? -1 : 1;

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'ascending'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      } else {
        return sortConfig.direction === 'ascending'
          ? aValue - bValue
          : bValue - aValue;
      }
    });
  };

  if (loading) return <div>Loading franchise data...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!franchiseInfo) return <div>Franchise not found. Please check the team ID.</div>

  return (
    <div>
      <h1>{franchiseInfo.team_name} Franchise History</h1>
      <p>Years Active: {franchiseInfo.start_year || 'N/A'} - {franchiseInfo.end_year || 'N/A'}</p>

      <h2>Season History</h2>
      {seasonHistory.length > 0 ? (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th
                  style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left', cursor: 'pointer' }}
                  onClick={() => requestSort('season_id')}
                >
                  Season {sortConfig.key === 'season_id' ? (sortConfig.direction === 'ascending' ? ' ▲' : ' ▼') : ''}
                </th>
                <th
                  style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left', cursor: 'pointer' }}
                  onClick={() => requestSort('team_name')}
                >
                  Team {sortConfig.key === 'team_name' ? (sortConfig.direction === 'ascending' ? ' ▲' : ' ▼') : ''}
                </th>
                <th
                  style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left', cursor: 'pointer' }}
                  onClick={() => requestSort('wins')}
                >
                  Wins {sortConfig.key === 'wins' ? (sortConfig.direction === 'ascending' ? ' ▲' : ' ▼') : ''}
                </th>
                <th
                  style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left', cursor: 'pointer' }}
                  onClick={() => requestSort('losses')}
                >
                  Losses {sortConfig.key === 'losses' ? (sortConfig.direction === 'ascending' ? ' ▲' : ' ▼') : ''}
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedData(seasonHistory).map((season) => (
                <tr key={`${season.team_code}-${season.season_id}`}>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                    <Link to={`/teams/${season.team_code}/${season.season_id}`}>{season.season_id}</Link>
                  </td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{season.team_name}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{season.wins}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{season.losses}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No season history available for this franchise.</p>
      )}
    </div>
  );
};

export default TeamFranchisePage;