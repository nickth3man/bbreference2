import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { executeQuery } from '../services/duckdbService';

const PlayerPage = () => {
  const { id } = useParams();
  const [playerInfo, setPlayerInfo] = useState(null);
  const [careerStats, setCareerStats] = useState([]);
  const [seasonStats, setSeasonStats] = useState([]);
  const [playoffStats, setPlayoffStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('perGame'); // 'perGame', 'totals', 'advanced', 'playoffs'

  useEffect(() => {
    const fetchPlayerData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch Player Info from common_player_info.csv
        const playerInfoQuery = `
          SELECT *
          FROM "common_player_info.csv"
          WHERE "player_id" = '${id}'
        `;
        const playerInfoResult = await executeQuery(playerInfoQuery);
        setPlayerInfo(playerInfoResult.length > 0 ? playerInfoResult[0] : null);

        // Fetch Career Stats (Player Career Info.csv)
        const careerStatsQuery = `
          SELECT *
          FROM "Player Career Info.csv"
          WHERE "player_id" = '${id}'
        `;
        const careerStatsResult = await executeQuery(careerStatsQuery);
        setCareerStats(careerStatsResult);

        // Fetch Season Stats (Player Per Game.csv, Player Totals.csv, Advanced.csv, Per 36 Minutes.csv, Per 100 Poss.csv, Player Shooting.csv, Player Play By Play.csv)
        // For simplicity, we'll start with Per Game and add more later or combine
        const seasonStatsQuery = `
          SELECT *
          FROM "Player Per Game.csv"
          WHERE "player_id" = '${id}'
          ORDER BY "Season" ASC
        `;
        const seasonStatsResult = await executeQuery(seasonStatsQuery);
        setSeasonStats(seasonStatsResult);

        // Fetch Playoff Stats (Currently assuming a 'Player Playoff.csv' or similar is available)
        // If not, this query will need to be adjusted based on actual data sources for playoff data.
        const playoffStatsQuery = `
          SELECT *
          FROM "Player Playoff.csv"
          WHERE "player_id" = '${id}'
          ORDER BY "Season" ASC
        `;

        // The above query assumes a file named "Player Playoff.csv".
        // Based on architecture.md, Player Playoff Stats are assumed from BRef structure.
        // For now, if "Player Playoff.csv" does not exist, consider joining with existing "Player Per Game.csv"
        // filtering for rows where "playoffs" column is true (if such column exists and indicates playoff stats).
        // Or, if "PlayoffStats.csv" is implemented, use that.
        // For this initial implementation, we'll use a placeholder or assume a similar structure to Player Per Game.
        // As per architecture.md, PlayoffStats CSV is "Assumed from BRef structure; not explicitly listed in current `csv/` contents, but will align if available"
        // For now, let's make a generic query that would work if "Player Playoff.csv" existed, and document the need for actual playoff data.
        const actualPlayoffStatsQuery = `
          SELECT *
          FROM "Player Per Game.csv"  --Placeholder: Use actual playoff CSV when available
          WHERE "player_id" = '${id}' AND "Lg" = 'NBA' AND "Tm" LIKE '%(playoffs)%' -- Example condition if included in Player Per Game
          ORDER BY "Season" ASC
        `;
        // Above "Tm" LIKE '%(playoffs)%' is a hypothetical way BRef may represent playoff rows in a combined CSV.
        // This needs actual data shape confirmation. For now, it's a pointer.
        const playoffStatsResult = await executeQuery(actualPlayoffStatsQuery);
        setPlayoffStats(playoffStatsResult);


      } catch (err) {
        console.error("Error fetching player data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayerData();
  }, [id]);

  const renderPlayerInfo = () => {
    if (!playerInfo) return <p>Player information not found.</p>;
    return (
      <div>
        <h2>{playerInfo.Player}</h2>
        <p>Position: {playerInfo.Pos || 'N/A'}</p>
        <p>Height: {playerInfo.Ht || 'N/A'}</p>
        <p>Weight: {playerInfo.Wt || 'N/A'}</p>
        <p>Born: {playerInfo["Date of Birth"] || 'N/A'}</p>
        <p>College: {playerInfo.College || 'N/A'}</p>
        <p>Draft: {playerInfo.Draft || 'N/A'}</p>
      </div>
    );
  };

  const renderCareerSummary = () => {
    if (careerStats.length === 0) return null;
    const career = careerStats[0]; // Assuming one career summary row for the player
    return (
      <div>
        <h3>Career Summary</h3>
        <p>Seasons: {career["Yrs"]}</p>
        <p>Games: {career["G"]}</p>
        <p>Points Per Game: {career["PTS/G"]}</p>
        <p>Rebounds Per Game: {career["TRB/G"]}</p>
        <p>Assists Per Game: {career["AST/G"]}</p>
      </div>
    );
  };

  const renderStatsTable = (data, title) => {
    if (!data || data.length === 0) return <h3>{title} Stats Not Available</h3>;

    // Extract headers dynamically from the first object, excluding player_id
    const headers = Object.keys(data[0]).filter(key => key !== 'player_id');

    return (
      <div>
        <h3>{title}</h3>
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
                      {header === 'Tm' ? <Link to={`/teams/${row['team_code']}/${row['Season']}`}>{row[header]}</Link> : row[header]}
                      {/* Assuming team_code exists for linking team season pages */}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  if (loading) return <div>Loading player data...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!playerInfo) return <div>Player not found.</div>;

  return (
    <div>
      <h1>Player Profile</h1>
      {renderPlayerInfo()}
      {renderCareerSummary()}

      <div>
        <button onClick={() => setActiveTab('perGame')}>Per Game</button>
        <button onClick={() => setActiveTab('totals')}>Totals</button>
        <button onClick={() => setActiveTab('advanced')}>Advanced</button>
        <button onClick={() => setActiveTab('playoffs')}>Playoffs</button>
      </div>

      {activeTab === 'perGame' && renderStatsTable(seasonStats, 'Regular Season Stats (Per Game)')}
      {/* Todo: Implement Totals and Advanced tabs with corresponding data queries and rendering */}
      {activeTab === 'playoffs' && renderStatsTable(playoffStats, 'Playoff Stats')}
      {/* For 'totals' and 'advanced' tabs, you would fetch data from Player Totals.csv and Advanced.csv respectively. */}
      {/* This requires additional queries and state variables similar to seasonStats and playoffStats. */}
      {/* For now, leaving comments as placeholders. */}
    </div>
  );
};

export default PlayerPage;