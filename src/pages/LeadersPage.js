import React, { useState, useEffect } from 'react';
import { executeQuery } from '../services/duckdbService';
import { Link } from 'react-router-dom';

const LeadersPage = () => {
  const [careerLeaders, setCareerLeaders] = useState([]);
  const [seasonLeaders, setSeasonLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('career'); // 'career', 'season'

  useEffect(() => {
    const fetchLeadersData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch Career Leaders (e.g., all-time points leaders)
        // This query requires aggregating data from Player Career Info.csv or similar.
        // For simplicity, let's take top 10 from Player Career Info.csv based on total PTS (assuming a "PTS" or "Total PTS" column)
        const careerLeadersQuery = `
          SELECT
            "Player Directory.csv"."Player" AS player_name,
            "Player Career Info.csv"."player_id",
            "Player Career Info.csv"."PTS" AS total_points
          FROM "Player Career Info.csv"
          JOIN "Player Directory.csv" ON "Player Career Info.csv"."player_id" = "Player Directory.csv"."player_id"
          ORDER BY "Player Career Info.csv"."PTS" DESC
          LIMIT 10;
        `;
        const careerLeadersResult = await executeQuery(careerLeadersQuery);
        setCareerLeaders(careerLeadersResult);

        // Fetch Single-Season Leaders (e.g., single-season points leaders)
        // This queries the max from Player Per Game.csv for a specific stat across all seasons.
        const seasonLeadersQuery = `
          SELECT
            "Player Directory.csv"."Player" AS player_name,
            "Player Per Game.csv"."player_id",
            "Player Per Game.csv"."Season" AS season,
            "Player Per Game.csv"."PTS" AS points_per_game_season_high
          FROM "Player Per Game.csv"
          JOIN "Player Directory.csv" ON "Player Per Game.csv"."player_id" = "Player Directory.csv"."player_id"
          ORDER BY "Player Per Game.csv"."PTS" DESC
          LIMIT 10;
        `;
        const seasonLeadersResult = await executeQuery(seasonLeadersQuery);
        setSeasonLeaders(seasonLeadersResult);

      } catch (err) {
        console.error("Error fetching leaders data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLeadersData();
  }, []);

  const renderTable = (data, type) => {
    if (!data || data.length === 0) return <p>No leaders available.</p>;

    const headers = type === 'career'
      ? ['Player', 'Total Points']
      : ['Player', 'Season', 'Points Per Game'];

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
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                  <Link to={`/players/${row.player_id}`}>{row.player_name}</Link>
                </td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                  {type === 'career' ? row.total_points : row.season}
                </td>
                {type === 'season' &&
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{row.points_per_game_season_high}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  if (loading) return <div>Loading leaders...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>League Leaders & Records</h1>
      <div>
        <button onClick={() => setActiveTab('career')}>Career Leaders</button>
        <button onClick={() => setActiveTab('season')}>Single-Season Records</button>
      </div>

      {activeTab === 'career' && renderTable(careerLeaders, 'career')}
      {activeTab === 'season' && renderTable(seasonLeaders, 'season')}
    </div>
  );
};

export default LeadersPage;