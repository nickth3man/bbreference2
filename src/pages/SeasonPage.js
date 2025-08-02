import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { executeQuery } from '../services/duckdbService';

const SeasonPage = () => {
  const { year } = useParams();
  const [standings, setStandings] = useState([]);
  const [leagueLeaders, setLeagueLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSeasonData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch standings from Team Summaries.csv
        const standingsQuery = `
          SELECT
            "Team Code",
            "Team",
            "W",
            "L",
            "W/L%"
          FROM "Team Summaries.csv"
          WHERE "Season" = '${year}'
          ORDER BY "W" DESC;
        `;
        const standingsResult = await executeQuery(standingsQuery);
        setStandings(standingsResult);

        // Fetch league leaders from Player Per Game.csv (top scorers for example)
        // This will need to be expanded for various categories as per design.md (e.g., rebounds, assists)
        const leadersQuery = `
          SELECT
            "Player Directory.csv"."Player" AS player_name,
            "Player Per Game.csv"."player_id",
            "Player Per Game.csv"."PTS" AS points_per_game,
            "Player Per Game.csv"."TRB" AS rebounds_per_game,
            "Player Per Game.csv"."AST" AS assists_per_game
          FROM "Player Per Game.csv"
          JOIN "Player Directory.csv" ON "Player Per Game.csv"."player_id" = "Player Directory.csv"."player_id"
          WHERE "Player Per Game.csv"."Season" = '${year}' AND "Player Per Game.csv"."Lg" = 'NBA'
          ORDER BY "Player Per Game.csv"."PTS" DESC
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

  if (loading) return <div>Loading season data...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>{year} NBA Season Summary</h1>

      <h2>Standings</h2>
      {standings.length > 0 ? (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Team</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Wins</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Losses</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Win %</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((team, index) => (
              <tr key={index}>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                  <Link to={`/teams/${team["Team Code"]}/${year}`}>{team.Team}</Link>
                </td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{team.W}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{team.L}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{team["W/L%"]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No standings available for this season.</p>
      )}

      <h2>League Leaders</h2>
      {leagueLeaders.length > 0 ? (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Player</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>PTS</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>TRB</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>AST</th>
            </tr>
          </thead>
          <tbody>
            {leagueLeaders.map((player, index) => (
              <tr key={index}>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                  <Link to={`/players/${player.player_id}`}>{player.player_name}</Link>
                </td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{player.points_per_game}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{player.rebounds_per_game}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{player.assists_per_game}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No league leaders available for this season.</p>
      )}

      <div>
        <Link to={`/playoffs/${year}`}>View {year} Playoffs</Link>
      </div>
    </div>
  );
};
export default SeasonPage;