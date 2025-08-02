import React, { useState, useEffect } from 'react';
import { executeQuery } from '../services/duckdbService';
import { Link } from 'react-router-dom';

const TeamsIndex = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setLoading(true);
        // Query to get distinct team names and their earliest/latest years from team_history.csv
        // This query assumes a 'team_history.csv' table exists, which tracks team codes and names across seasons.
        // The architecture.md suggests 'team_history.csv' and potentially creating a franchise_id.
        // For simplicity, we'll group by a unique team identifier for now and link to a /teams/:teamId page.
        // We might need a separate mapping for true franchise_id later if the data doesn't provide it directly.
        // Example: Grouping by 'team_code' from a team_details.csv or similar.
        // Given the available CSVs, "team.csv" seems like a good starting point for distinct teams.
        const query = `
          SELECT
            "Team Code",
            "Team Name" AS team_name,
            MIN("YearS") AS start_year,
            MAX("YearE") AS end_year
          FROM "team.csv"
          GROUP BY "Team Code", "Team Name"
          ORDER BY "Team Name" ASC;
        `;
        // Note: The "team.csv" has "Team Code" and "Team Name" which seems like a direct fit.
        // "YearS" and "YearE" would be relevant if we had "team_history.csv" ingested with actual start/end years for each team code.
        // For now, let's just use "Team Code" and "Team Name" from "team.csv" and assume "Team Code" can serve as a simple team identifier for routing to team franchise pages.
        // Based on architecture.md, team.csv is a "Master list of franchises and their historical team codes."
        // We will need to decide on a "franchise_id" later if `team.csv` doesn't provide a direct concept for it.
        // For now, using "Team Code" for teamId in the URL, assuming it's unique enough for distinct pages.
        // If "team.csv" has a direct franchise identifier, we should use that. For consistency with BRef, "Team Code" is often the URL slug.

        const initialQuery = `
          SELECT DISTINCT
            "Abbreviation" AS team_code,
            "Team" AS team_name
          FROM "Team Abbrev.csv"
          ORDER BY "Team" ASC;
        `;
        // This uses "Team Abbrev.csv" which should provide a good list of team codes and names.
        // We might need more sophisticated joining to get start_year/end_year across the various team CSVs.
        // For the sake of getting the page structure up, we'll use this simplified query.

        // Refined query to get start and end year using team_history.csv if available.
        // If "team_history.csv" is loaded as "team_history", then this would be better:
        const refinedQuery = `
          SELECT
            th."team_code" AS team_code,
            th."team_name" AS team_name,
            MIN(th."season_id") AS start_year,
            MAX(th."season_id") AS end_year
          FROM "team_history.csv" AS th
          GROUP BY th."team_code", th."team_name"
          ORDER BY th."team_name" ASC;
        `;
        // Assuming "team_history.csv" has "team_code", "team_name", "season_id" columns.
        // If not, we fall back to "Team Abbrev.csv"

        const result = await executeQuery(refinedQuery); // using refined query
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
              {team.team_name} ({team.start_year}-{team.end_year})
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TeamsIndex;