import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { executeQuery } from '../services/duckdbService';

const PlayoffPage = () => {
  const { year } = useParams();
  const [playoffResults, setPlayoffResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlayoffData = async () => {
      try {
        setLoading(true);
        setError(null);

        // For now, we'll try to get game summaries related to playoffs for a given year.
        // The architecture.md mentions "PlayoffStats" CSV, but it's "Assumed from BRef structure; not explicitly listed in current `csv/` contents".
        // If a dedicated playoff results file exists (e.g., playoff_outcomes.csv), use that.
        // Otherwise, we'll try to infer playoff games from 'game_info.csv' or 'game.csv' based on season type, if available.
        // For a simple start, we can display all games from the given year that might relate to playoffs.
        // This query is highly dependent on the actual CSV structure for playoff data.
        // Let's assume 'game.csv' has a 'Season' column and playoff games can be identified.
        // This is a placeholder; actual playoff bracket visualization would require more complex data joining.

        // A more realistic query would involve joining game_info with game.csv to identify playoff series.
        // For MVP, we would need to check which CSV contains 'playoff series outcomes' or 'bracket progression'.
        // Given the current CSV list, a direct "playoff bracket" is not explicitly available.
        // To build a basic Playoff Page, focusing on game summaries or team vs team results might be the initial approach.

        // Let's attempt to pull game information for the specified season, implying it might include playoff games.
        // The display will be a list of these games, and ideally, if we had "series" info, we'd group them.
        const query = `
          SELECT
            g."game_id",
            g."Date" AS game_date,
            gi."Visitor/Neutral_Team" AS visitor_team,
            gi."Home_Team" AS home_team,
            gi."Visitor/Neutral_Pts" AS visitor_points,
            gi."Home_Pts" AS home_points,
            g."Playoffs" -- Assuming game.csv has a 'Playoffs' column (boolean or indicator)
          FROM "game.csv" AS g
          JOIN "game_info.csv" AS gi ON g."game_id" = gi."game_id"
          WHERE STRFTIME('%Y', g."Date") = '${year}' -- Filter by year from game date
          AND g."Playoffs" = TRUE -- Assuming a boolean column marking playoff games
          ORDER BY g."Date" ASC;
        `;
        // NOTE: The existence and data type of "Playoffs" column in "game.csv" needs to be confirmed.
        // If it's not a boolean and marks playoff games with another value (e.g., 'Y'/'N' or specific season IDs), adjust WHERE clause.
        // Alternatively, if there's a specific 'PlayoffStats.csv' or 'playoff_outcomes.csv', that would be preferred.

        // If the 'Playoffs' column in 'game.csv' is actually 'true' or 'false' (boolean), then the query above is fine.
        // If it's a field like "season_type" and 'Playoffs' is a value, it would be:
        // WHERE g."Season Type" = 'Playoffs'
        // For now, we proceed with the current assumption.

        const result = await executeQuery(query);
        setPlayoffResults(result);

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
      <h1>{year} NBA Playoffs</h1>

      {playoffResults.length > 0 ? (
        <div>
          <h2>Playoff Game Summaries</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Date</th>
                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Visitor</th>
                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Points</th>
                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Home</th>
                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Points</th>
              </tr>
            </thead>
            <tbody>
              {playoffResults.map((game) => (
                <tr key={game.game_id}>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{game.game_date}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                    <Link to={`/teams/${game.visitor_team}/${year}`}>{game.visitor_team}</Link>
                  </td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{game.visitor_points}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                    <Link to={`/teams/${game.home_team}/${year}`}>{game.home_team}</Link>
                  </td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{game.home_points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No playoff results available for {year}.</p>
      )}

      <div>
        <Link to={`/seasons/${year}`}>Back to {year} Season Summary</Link>
      </div>
    </div>
  );
};

export default PlayoffPage;