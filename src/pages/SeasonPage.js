import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { executeQuery } from '../services/duckdbService';

const SeasonPage = () => {
  const { year } = useParams();
  const [standings, setStandings] = useState([]);
  const [leagueLeaders, setLeagueLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortConfigStandings, setSortConfigStandings] = useState({ key: null, direction: 'ascending' });
  const [sortConfigLeaders, setSortConfigLeaders] = useState({ key: null, direction: 'ascending' });

  // Re-usable helper functions for formatting headers and values
  const formatHeader = (header) => {
    switch (header) {
      case 'team_code': return 'Tm';
      case 'team_name': return 'Team';
      case 'season_id': return 'Season';
      case 'wins': return 'W';
      case 'losses': return 'L';
      case 'win_loss_percentage': return 'W/L%';
      case 'playoff_status': return 'Playoffs';
      case 'player_name': return 'Player';
      case 'points_per_game': return 'PTS';
      case 'rebounds_per_game': return 'TRB';
      case 'assists_per_game': return 'AST';
      default: return header.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    }
  };

  const formatValue = (key, value) => {
    const percentageKeys = ['win_loss_percentage'];
    const oneDecimalKeys = ['points_per_game', 'rebounds_per_game', 'assists_per_game'];

    if (typeof value === 'number') {
      if (percentageKeys.includes(key)) {
        return value.toFixed(3);
      }
      if (oneDecimalKeys.includes(key)) {
        return value.toFixed(1);
      }
      return value;
    }
    return value;
  };

  useEffect(() => {
    const fetchSeasonData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch standings from TeamSeasonRecords table
        const standingsQuery = `
          SELECT
            team_code,
            team_name,
            wins,
            losses,
            win_loss_percentage,
            playoff_status
          FROM TeamSeasonRecords
          WHERE season_id = '${year}'
          ORDER BY wins DESC;
        `;
        const standingsResult = await executeQuery(standingsQuery);
        setStandings(standingsResult);

        // Fetch league leaders from PlayerPerGame table, joined with Players
        const leadersQuery = `
          SELECT
            ppg.player_id,
            p.player_name,
            ppg.pts_per_game AS points_per_game,
            ppg.trb_per_game AS rebounds_per_game,
            ppg.ast_per_game AS assists_per_game
          FROM PlayerPerGame AS ppg
          JOIN Players AS p ON ppg.player_id = p.player_id
          WHERE ppg.season = '${year}' AND ppg.lg = 'NBA' AND ppg.tm <> 'TOT'
          ORDER BY ppg.pts_per_game DESC
          LIMIT 10;
        `;
        const leadersResult = await executeQuery(leadersQuery);
        setLeagueLeaders(leadersResult);

      } catch (err) {
        console.error("Error fetching season data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSeasonData();
  }, [year]);

  const requestSort = (key, type) => {
    let direction = 'ascending';
    if (type === 'standings') {
      if (sortConfigStandings.key === key && sortConfigStandings.direction === 'ascending') {
        direction = 'descending';
      }
      setSortConfigStandings({ key, direction });
    } else if (type === 'leaders') {
      if (sortConfigLeaders.key === key && sortConfigLeaders.direction === 'ascending') {
        direction = 'descending';
      }
      setSortConfigLeaders({ key, direction });
    }
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

  if (loading) return <div>Loading season data...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>{year} NBA Season Summary</h1>

      <h2 style={{marginTop: '20px'}}>Standings</h2>
      {standings.length > 0 ? (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
            <thead>
              <tr>
                <th
                  style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left', cursor: 'pointer' }}
                  onClick={() => requestSort('team_name', 'standings')}
                >
                  {formatHeader('team_name')} {sortConfigStandings.key === 'team_name' ? (sortConfigStandings.direction === 'ascending' ? ' ▲' : ' ▼') : ''}
                </th>
                <th
                  style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left', cursor: 'pointer' }}
                  onClick={() => requestSort('wins', 'standings')}
                >
                  {formatHeader('wins')} {sortConfigStandings.key === 'wins' ? (sortConfigStandings.direction === 'ascending' ? ' ▲' : ' ▼') : ''}
                </th>
                <th
                  style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left', cursor: 'pointer' }}
                  onClick={() => requestSort('losses', 'standings')}
                >
                  {formatHeader('losses')} {sortConfigStandings.key === 'losses' ? (sortConfigStandings.direction === 'ascending' ? ' ▲' : ' ▼') : ''}
                </th>
                <th
                  style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left', cursor: 'pointer' }}
                  onClick={() => requestSort('win_loss_percentage', 'standings')}
                >
                  {formatHeader('win_loss_percentage')} {sortConfigStandings.key === 'win_loss_percentage' ? (sortConfigStandings.direction === 'ascending' ? ' ▲' : ' ▼') : ''}
                </th>
                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>{formatHeader('playoff_status')}</th>
              </tr>
            </thead>
            <tbody>
              {sortedData(standings, sortConfigStandings).map((team, index) => (
                <tr key={team.team_code}>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                    <Link to={`/teams/${team.team_code}/${year}`}>{team.team_name}</Link>
                  </td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{team.wins}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{team.losses}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{formatValue('win_loss_percentage', team.win_loss_percentage)}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{team.playoff_status ? 'Yes' : 'No'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No standings available for this season.</p>
      )}

      <h2 style={{marginTop: '20px'}}>League Leaders (Top 10)</h2>
      {leagueLeaders.length > 0 ? (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
            <thead>
              <tr>
                <th
                  style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left', cursor: 'pointer' }}
                  onClick={() => requestSort('player_name', 'leaders')}
                >
                  {formatHeader('player_name')} {sortConfigLeaders.key === 'player_name' ? (sortConfigLeaders.direction === 'ascending' ? ' ▲' : ' ▼') : ''}
                </th>
                <th
                  style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left', cursor: 'pointer' }}
                  onClick={() => requestSort('points_per_game', 'leaders')}
                >
                  {formatHeader('points_per_game')} {sortConfigLeaders.key === 'points_per_game' ? (sortConfigLeaders.direction === 'ascending' ? ' ▲' : ' ▼') : ''}
                </th>
                <th
                  style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left', cursor: 'pointer' }}
                  onClick={() => requestSort('rebounds_per_game', 'leaders')}
                >
                  {formatHeader('rebounds_per_game')} {sortConfigLeaders.key === 'rebounds_per_game' ? (sortConfigLeaders.direction === 'ascending' ? ' ▲' : ' ▼') : ''}
                </th>
                <th
                  style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left', cursor: 'pointer' }}
                  onClick={() => requestSort('assists_per_game', 'leaders')}
                >
                  {formatHeader('assists_per_game')} {sortConfigLeaders.key === 'assists_per_game' ? (sortConfigLeaders.direction === 'ascending' ? ' ▲' : ' ▼') : ''}
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedData(leagueLeaders, sortConfigLeaders).map((player, index) => (
                <tr key={player.player_id}>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                    <Link to={`/players/${player.player_id}`}>{player.player_name}</Link>
                  </td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{formatValue('points_per_game', player.points_per_game)}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{formatValue('rebounds_per_game', player.rebounds_per_game)}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{formatValue('assists_per_game', player.assists_per_game)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No league leaders available for this season.</p>
      )}

      <div style={{ marginTop: '20px' }}>
        <Link to={`/playoffs/${year}`}>View {year} Playoffs</Link>
      </div>
    </div>
  );
};
export default SeasonPage;