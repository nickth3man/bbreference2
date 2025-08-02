import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { executeQuery } from '../services/duckdbService';

const PlayoffPage = () => {
  const { year } = useParams();
  const [playoffSummary, setPlayoffSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Re-usable helper functions for formatting headers and values
  const formatHeader = (header) => {
    switch (header) {
      case 'game_date': return 'Date';
      case 'visitor_team_code': return 'Visitor (Code)';
      case 'home_team_code': return 'Home (Code)';
      case 'visitor_points': return 'Visitor PTS';
      case 'home_points': return 'Home PTS';
      case 'visitor_team_name': return 'Visitor';
      case 'home_team_name': return 'Home';
      default: return header.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    }
  };

  const formatValue = (key, value) => {
    // No specific formatting needed for these values typically.
    return value;
  };

  useEffect(() => {
    const fetchPlayoffData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch playoff game data from GamesRaw table, joining with TeamSeasonRecords for full team names.
        const playoffQuery = `
          SELECT
            g.game_id,
            g.game_date,
            g.team_abbreviation_away AS visitor_team_code,
            g.team_abbreviation_home AS home_team_code,
            g.pts_away AS visitor_points,
            g.pts_home AS home_points,
            tsr_away.team_name AS visitor_team_name,
            tsr_home.team_name AS home_team_name
          FROM Games AS g
          LEFT JOIN TeamSeasonRecords AS tsr_away ON g.team_abbreviation_away = tsr_away.team_code AND g.season_id = CAST('${year}' AS INTEGER)
          LEFT JOIN TeamSeasonRecords AS tsr_home ON g.team_abbreviation_home = tsr_home.team_code AND g.season_id = CAST('${year}' AS INTEGER)
          WHERE g.season_id = CAST('${year}' AS INTEGER) AND g.season_type = 'Playoffs'
          ORDER BY g.game_date ASC;
        `;
        const result = await executeQuery(playoffQuery);
        setPlayoffSummary(result);

      } catch (err) {
        console.error("Error fetching playoff data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayoffData();
  }, [year]);

  if (loading) return <div>Loading {year} playoff data...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>NBA {year} Playoffs</h1>
      {playoffSummary.length > 0 ? (
        <div>
          <h2>Playoff Games</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
              <thead>
                <tr>
                  {Object.keys(playoffSummary[0]).filter(key => key !== 'game_id' && key !== 'visitor_team_code' && key !== 'home_team_code').map((header) => (
                    <th key={header} style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>
                      {formatHeader(header)}
                    </th>
                  ))}
                  <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Score</th>
                </tr>
              </thead>
              <tbody>
                {playoffSummary.map((game, index) => (
                  <tr key={game.game_id || index}>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{formatValue('game_date', game.game_date)}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                      <Link to={`/teams/${game.visitor_team_code}/${year}`}>{game.visitor_team_name}</Link>
                    </td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                      {game.visitor_points} - {game.home_points}
                    </td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                      <Link to={`/teams/${game.home_team_code}/${year}`}>{game.home_team_name}</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{marginTop: '10px'}}>
            Note: This is a simplified view of playoff games. A full bracket or series-by-series view would require more
            complex data aggregation and UI logic.
          </p>
        </div>
      ) : (
        <p>No playoff data available for {year}.</p>
      )}
    </div>
  );
};

export default PlayoffPage;