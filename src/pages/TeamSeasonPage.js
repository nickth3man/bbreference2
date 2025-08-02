import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { executeQuery } from '../services/duckdbService';

const TeamSeasonPage = () => {
  const { teamId, year } = useParams();
  const [teamSeasonStats, setTeamSeasonStats] = useState(null);
  const [rosterStats, setRosterStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTeamSeasonData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch team season summary stats from Team Summaries.csv or Team Season Stats.csv
        const teamSummaryQuery = `
          SELECT *
          FROM "Team Summaries.csv"
          WHERE "Team Code" = '${teamId}' AND "Season" = '${year}'
        `;
        const teamSummaryResult = await executeQuery(teamSummaryQuery);
        setTeamSeasonStats(teamSummaryResult.length > 0 ? teamSummaryResult[0] : null);

        // Fetch roster stats for that specific season from Player Per Game.csv
        // We'll join with Player Directory.csv to get player names
        const rosterStatsQuery = `
          SELECT
            ppg.*,
            pd."Player" AS player_name
          FROM "Player Per Game.csv" AS ppg
          JOIN "Player Directory.csv" AS pd
          ON ppg."player_id" = pd."player_id"
          WHERE ppg."Tm" = '${teamId}' AND ppg."Season" = '${year}' AND ppg."Lg" = 'NBA'
          ORDER BY ppg."PTS" DESC;
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

  if (loading) return <div>Loading team season data...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!teamSeasonStats) return <div>Team season data not found.</div>;

  const renderRosterTable = (data) => {
    if (!data || data.length === 0) return <p>Roster stats not available.</p>;

    // Exclude 'player_id', 'Tm', 'Lg' from headers for cleaner display
    const headers = Object.keys(data[0]).filter(key => !['player_id', 'Tm', 'Lg'].includes(key));

    return (
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {headers.map((header) => (
                <th key={header} style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={index}>
                {headers.map((header) => (
                  <td key={header} style={{ border: '1px solid #ddd', padding: '8px' }}>
                    {header === 'player_name' && row.player_id
                      ? <Link to={`/players/${row.player_id}`}>{row[header]}</Link>
                      : row[header]}
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
      <h1>{teamSeasonStats.Team} {teamSeasonStats.Season} Season</h1>
      <p>Record: {teamSeasonStats.W} - {teamSeasonStats.L}</p>
      <p>Coach: {teamSeasonStats.Coach || 'N/A'}</p>
      <p>{teamSeasonStats.Notes || 'No additional notes for this season.'}</p>

      <h2>Roster Stats (Per Game)</h2>
      {renderRosterTable(rosterStats)}

      <div>
        <Link to={`/teams/${teamId}`} style={{ marginRight: '10px' }}>Back to Franchise History</Link>
      </div>
    </div>
  );
};
export default TeamSeasonPage;