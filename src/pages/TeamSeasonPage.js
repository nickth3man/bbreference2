import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { executeQuery } from '../services/duckdbService';

const TeamSeasonPage = () => {
  const { teamId, year } = useParams();
  const [teamSeasonStats, setTeamSeasonStats] = useState(null);
  const [rosterStats, setRosterStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

  // Re-usable helper functions for formatting headers and values, similar to PlayerPage.js
  const formatHeader = (header) => {
    switch (header) {
      case 'team_name': return 'Team';
      case 'season': return 'Season';
      case 'lg': return 'Lg';
      case 'tm': return 'Tm';
      case 'player_name': return 'Player';
      case 'position': return 'Pos';
      case 'g': return 'G';
      case 'gs': return 'GS';
      case 'mp_per_game': return 'MP';
      case 'fg_percent': return 'FG%';
      case 'x3p_percent': return '3P%';
      case 'ft_percent': return 'FT%';
      case 'trb_per_game': return 'TRB';
      case 'ast_per_game': return 'AST';
      case 'stl_per_game': return 'STL';
      case 'blk_per_game': return 'BLK';
      case 'pts_per_game': return 'PTS';
      // Add other common headers as needed
      default: return header.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    }
  };

  const formatValue = (key, value) => {
    const percentageKeys = ['fg_percent', 'x3p_percent', 'ft_percent'];
    const oneDecimalKeys = ['mp_per_game', 'trb_per_game', 'ast_per_game', 'stl_per_game', 'blk_per_game', 'pts_per_game'];

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
    const fetchTeamSeasonData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch team season summary stats from TeamSummaries table
        // Use 'abbreviation' for team code and 'Season' (capital S) for season in TeamSummaries
        const teamSummaryQuery = `
          SELECT
            Season,
            Lg,
            team AS team_name_full,
            abbreviation AS team_code,
            playoffs AS playoff_status,
            w AS wins,
            l AS losses,
            "W/L%" AS win_loss_percentage,
            "Coaches" AS coaches,
            "Top WS" AS top_ws_player,
            "PTS" AS total_pts,
            "TRB" AS total_trb,
            "AST" AS total_ast
          FROM TeamSummaries
          WHERE abbreviation = '${teamId}' AND Season = '${year}';
        `;
        const teamSummaryResult = await executeQuery(teamSummaryQuery);
        setTeamSeasonStats(teamSummaryResult.length > 0 ? teamSummaryResult[0] : null);

        // Fetch roster stats for that specific season from PlayerPerGame table
        // Join with the consolidated Players table for player names and bio info
        const rosterStatsQuery = `
          SELECT
            ppg.player_id,
            p.player_name,
            p.position AS pos_main, -- Primary position from consolidated Players table
            ppg.pos, -- Pos from per-game (can be different per season)
            ppg.age,
            ppg.tm,
            ppg.lg,
            ppg.g,
            ppg.gs,
            ppg.mp_per_game,
            ppg.fg_per_game,
            ppg.fga_per_game,
            ppg.fg_percent,
            ppg.x3p_per_game,
            ppg.x3pa_per_game,
            ppg.x3p_percent,
            ppg.x2p_per_game,
            ppg.x2pa_per_game,
            ppg.x2p_percent,
            ppg.e_fg_percent,
            ppg.ft_per_game,
            ppg.fta_per_game,
            ppg.ft_percent,
            ppg.orb_per_game,
            ppg.drb_per_game,
            ppg.trb_per_game,
            ppg.ast_per_game,
            ppg.stl_per_game,
            ppg.blk_per_game,
            ppg.tov_per_game,
            ppg.pf_per_game,
            ppg.pts_per_game
          FROM PlayerPerGame AS ppg
          JOIN Players AS p ON ppg.player_id = p.player_id
          WHERE ppg.tm = '${teamId}' AND ppg.season = '${year}' AND ppg.lg = 'NBA' AND ppg.g > 0 -- Only players with games played
          ORDER BY ppg.pts_per_game DESC;
        `;
        const rosterStatsResult = await executeQuery(rosterStatsQuery);
        setRosterStats(rosterStatsResult);

      } catch (err) {
        console.error("Error fetching team season data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamSeasonData();
  }, [teamId, year]);

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


  if (loading) return <div>Loading team season data...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!teamSeasonStats) return <div>Team season data not found for {teamId} {year}.</div>;

  const renderRosterTable = (data) => {
    if (!data || data.length === 0) return <p>Roster stats not available for this season.</p>;

    const excludedHeaders = ['player_id']; 
    let headers = Object.keys(data[0]).filter(key => !excludedHeaders.includes(key));

    const preferredOrderMap = {
      'player_name': 1, 'pos': 2, 'age': 3, 'g': 4, 'gs': 5, 'mp_per_game': 6,
      'fg_percent': 7, 'x3p_percent': 8, 'ft_percent': 9, 'trb_per_game': 10,
      'ast_per_game': 11, 'stl_per_game': 12, 'blk_per_game': 13, 'pts_per_game': 14
    };

    headers.sort((a, b) => {
      const orderA = preferredOrderMap[a.toLowerCase()] || 1000;
      const orderB = preferredOrderMap[b.toLowerCase()] || 1000;
      if (orderA === orderB) {
        return a.localeCompare(b);
      }
      return orderA - orderB;
    });

    return (
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
          <thead>
            <tr>
              {headers.map((header) => (
                <th
                  key={header}
                  onClick={() => requestSort(header)}
                  style={{
                    border: '1px solid #ddd',
                    padding: '8px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    backgroundColor: sortConfig.key === header ? '#f0f0f0' : 'inherit'
                  }}
                >
                  {formatHeader(header)}{sortConfig.key === header ? (sortConfig.direction === 'ascending' ? ' ▲' : ' ▼') : ''}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedData(data).map((row, index) => (
              <tr key={index}>
                {headers.map((header) => (
                  <td key={header} style={{ border: '1px solid #ddd', padding: '8px' }}>
                    {header === 'player_name'
                      ? <Link to={`/players/${row.player_id}`}>{row[header]}</Link>
                      : formatValue(header, row[header])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div>
      <h1>{teamSeasonStats.team_name_full} {teamSeasonStats.Season} Season</h1>
      <p>Record: {teamSeasonStats.wins} - {teamSeasonStats.losses} ({teamSeasonStats.win_loss_percentage ? teamSeasonStats.win_loss_percentage.toFixed(3) : 'N/A'}%)</p>
      <p>Coach: {teamSeasonStats.coaches || 'N/A'}</p>
      <p>Playoffs: {teamSeasonStats.playoff_status ? 'Yes' : 'No'}</p>
      
      <h2>Team Leaders</h2>
      <p>Top Win Share Player: {teamSeasonStats.top_ws_player || 'N/A'}</p>
      <p>Total Points: {teamSeasonStats.total_pts ? teamSeasonStats.total_pts.toLocaleString() : 'N/A'}</p>
      <p>Total Rebounds: {teamSeasonStats.total_trb ? teamSeasonStats.total_trb.toLocaleString() : 'N/A'}</p>
      <p>Total Assists: {teamSeasonStats.total_ast ? teamSeasonStats.total_ast.toLocaleString() : 'N/A'}</p>

      <h2>Roster Stats (Per Game Averages)</h2>
      {renderRosterTable(rosterStats)}

      <div style={{ marginTop: '20px' }}>
        <Link to={`/teams/${teamId}`} style={{ marginRight: '10px' }}>Back to Franchise History</Link>
        <Link to={`/seasons/${year}`}>View {year} Season Summary</Link>
      </div>
    </div>
  );
};

export default TeamSeasonPage;