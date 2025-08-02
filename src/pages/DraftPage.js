import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { executeQuery } from '../services/duckdbService';

const DraftPage = () => {
  const { year } = useParams();
  const [draftPicks, setDraftPicks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDraftData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch draft picks for the specific year from draft_history.csv
        // Joining with Player Directory.csv and Team Abbrev.csv for names
        const query = `
          SELECT
            dh."Pk" AS pick_number,
            dh."Rk" AS rank,
            dh."Rnd" AS round,
            pd."Player" AS player_name,
            dh."player_id",
            ta."Team" AS team_name,
            dh."Tm" AS team_code,
            dh."College"
          FROM "draft_history.csv" AS dh
          LEFT JOIN "Player Directory.csv" AS pd ON dh."player_id" = pd."player_id"
          LEFT JOIN "Team Abbrev.csv" AS ta ON dh."Tm" = ta."Abbreviation"
          WHERE dh."Draft Year" = '${year}'
          ORDER BY dh."Pk" ASC;
        `;
        const result = await executeQuery(query);
        setDraftPicks(result);
      } catch (err) {
        console.error("Error fetching draft data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDraftData();
  }, [year]);

  if (loading) return <div>Loading {year} draft data...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>{year} NBA Draft</h1>

      {draftPicks.length > 0 ? (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Pick</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Rnd</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Player</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Team</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>College</th>
            </tr>
          </thead>
          <tbody>
            {draftPicks.map((pick, index) => (
              <tr key={index}>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{pick.pick_number}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{pick.round}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                  {pick.player_id
                    ? <Link to={`/players/${pick.player_id}`}>{pick.player_name}</Link>
                    : pick.player_name || 'N/A'}
                </td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                  {pick.team_code
                    ? <Link to={`/teams/${pick.team_code}/${year}`}>{pick.team_name || pick.team_code}</Link>
                    : pick.team_name || 'N/A'}
                </td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{pick.College || 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No draft picks available for {year}.</p>
      )}
    </div>
  );
};

export default DraftPage;