import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { executeQuery } from '../services/duckdbService';

const TeamsIndex = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setLoading(true);
        // Query to get distinct team codes, team names, and their earliest/latest years from TeamSeasonRecords.
        // This table is created from TeamSummaries in duckdbService.js and contains season-level team data.
        const query = `
          SELECT
            team_code,
            team_name,
            MIN(CAST(season_id AS INTEGER)) AS start_year,
            MAX(CAST(season_id AS INTEGER)) AS end_year
          FROM TeamSeasonRecords
          GROUP BY team_code, team_name
          ORDER BY team_name ASC;
        `;
        const result = await executeQuery(query);
        setTeams(result);
      } catch (err) {
        console.error("Error fetching teams:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, []);

  if (loading) return <div>Loading teams...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Teams Index</h1>
      <ul>
        {teams.map((team) => (
          <li key={team.team_code}>
            <Link to={`/teams/${team.team_code}`}>
              {team.team_name} ({team.start_year}{team.start_year !== team.end_year ? `-${team.end_year}` : ''})
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TeamsIndex;