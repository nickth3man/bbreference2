import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '../hooks/useQuery';

const TeamsIndex = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: teams, loading, error } = useQuery(`
          SELECT
            team_code,
            team_name,
            MIN(CAST(season_id AS INTEGER)) AS start_year,
            MAX(CAST(season_id AS INTEGER)) AS end_year
          FROM TeamSeasonRecords
          WHERE team_name LIKE ? COLLATE NOCASE
          GROUP BY team_code, team_name
          ORDER BY team_name ASC;
        `, [`%${searchTerm}%`]);

  if (loading) return <div>Loading teams...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Teams Index</h1>
      <input
        type="text"
        placeholder="Search teams..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
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