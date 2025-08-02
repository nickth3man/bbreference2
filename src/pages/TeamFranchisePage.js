import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { executeQuery } from '../services/duckdbService';

const TeamFranchisePage = () => {
  const { teamId } = useParams(); // Using teamId as the franchise identifier for now
  const [franchiseInfo, setFranchiseInfo] = useState(null);
  const [seasonHistory, setSeasonHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFranchiseData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch franchise info from team.csv (or a dedicated franchise mapping table if available)
        // For simplicity, we'll try to get the "Team Name" and first/last year for the given teamId
        const franchiseInfoQuery = `
          SELECT
            "Team Code" AS team_code,
            "Team Name" AS team_name,
            MIN("YearS") AS start_year,
            MAX("YearE") AS end_year
          FROM "team.csv"
          WHERE "Team Code" = '${teamId}'
          GROUP BY "Team Code", "Team Name";
        `;
        const franchiseInfoResult = await executeQuery(franchiseInfoQuery);
        setFranchiseInfo(franchiseInfoResult.length > 0 ? franchiseInfoResult[0] : null);

        // Fetch season history for the franchise from team_history.csv
        // This will list all seasons for the team_code (which acts as a stand-in for franchise for now)
        const seasonHistoryQuery = `
          SELECT
            "season_id",
            "team_code",
            "team_name",
            "wins",
            "losses"
          FROM "team_history.csv"
          WHERE "team_code" = '${teamId}'
          ORDER BY "season_id" ASC;
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

  if (loading) return <div>Loading franchise data...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!franchiseInfo) return <div>Franchise not found.</div>

  return (
    <div>
      <h1>{franchiseInfo.team_name} Franchise History</h1>
      <p>Years Active: {franchiseInfo.start_year} - {franchiseInfo.end_year}</p>

      <h2>Season History</h2>
      {seasonHistory.length > 0 ? (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Season</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Team</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Wins</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Losses</th>
            </tr>
          </thead>
          <tbody>
            {seasonHistory.map((season) => (
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
      ) : (
        <p>No season history available for this franchise.</p>
      )}
    </div>
  );
};

export default TeamFranchisePage;