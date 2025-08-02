import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { executeQuery } from '../services/duckdbService';

const PlayerPage = () => {
  const { id } = useParams();
  const [playerInfo, setPlayerInfo] = useState(null);
  const [careerStats, setCareerStats] = useState(null);
  const [perGameStats, setPerGameStats] = useState([]);
  const [totalStats, setTotalStats] = useState([]);
  const [advancedStats, setAdvancedStats] = useState([]);
  const [playoffStats, setPlayoffStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('perGame'); // 'perGame', 'totals', 'advanced', 'playoffs'
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

  useEffect(() => {
    const fetchPlayerData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch Player Info from CommonPlayerInfo table
        const playerInfoQuery = `
          SELECT *
          FROM CommonPlayerInfo
          WHERE player_id = '${id}';
        `;
        const playerInfoResult = await executeQuery(playerInfoQuery);
        setPlayerInfo(playerInfoResult.length > 0 ? playerInfoResult[0] : null);

        // Fetch Career Stats from PlayerCareerInfo table
        const careerStatsQuery = `
          SELECT *
          FROM PlayerCareerInfo
          WHERE player_id = '${id}';
        `;
        const careerStatsResult = await executeQuery(careerStatsQuery);
        setCareerStats(careerStatsResult.length > 0 ? careerStatsResult[0] : null);

        // Fetch Season Stats (Per Game) from PlayerPerGame table
        const perGameStatsQuery = `
          SELECT
            season,
            lg,
            tm,
            g,
            gs,
            mp_per_game AS mp,
            fg_percent AS "fg_pct",
            x3p_percent AS "3p_pct",
            ft_percent AS "ft_pct",
            trb_per_game AS trb,
            ast_per_game AS ast,
            stl_per_game AS stl,
            blk_per_game AS blk,
            pts_per_game AS pts
          FROM PlayerPerGame
          WHERE player_id = '${id}' AND tm <> 'TOT'
          ORDER BY CAST(season AS INT) ASC;
        `;
        const perGameStatsResult = await executeQuery(perGameStatsQuery);
        setPerGameStats(perGameStatsResult);

        // Fetch Season Stats (Totals) from PlayerTotals table
        const totalStatsQuery = `
          SELECT
            season,
            lg,
            tm,
            g,
            gs,
            mp_total AS mp,
            fg_total AS fg,
            fga_total AS fga,
            x3p_total AS "3p",
            x3pa_total AS "3pa",
            ft_total AS ft,
            fta_total AS fta,
            orb_total AS orb,
            drb_total AS drb,
            trb_total AS trb,
            ast_total AS ast,
            stl_total AS stl,
            blk_total AS blk,
            tov_total AS tov,
            pf_total AS pf,
            pts_total AS pts
          FROM PlayerTotals
          WHERE player_id = '${id}' AND tm <> 'TOT'
          ORDER BY CAST(season AS INT) ASC;
        `;
        const totalStatsResult = await executeQuery(totalStatsQuery);
        setTotalStats(totalStatsResult);

        // Fetch Season Stats (Advanced) from PlayerAdvanced table
        const advancedStatsQuery = `
          SELECT
            season,
            lg,
            tm,
            g,
            mp AS mp_advanced,
            per,
            ts_percent AS ts_pct,
            x3p_ar AS "3p_ar",
            ft_ar AS "ft_ar",
            orb_percent AS orb_pct,
            drb_percent AS drb_pct,
            trb_percent AS trb_pct,
            ast_percent AS ast_pct,
            stl_percent AS stl_pct,
            blk_percent AS blk_pct,
            tov_percent AS tov_pct,
            usg_percent AS usg_pct,
            ows,
            dws,
            ws,
            ws_48 AS ws_per_48,
            obpm,
            dbpm,
            bpm,
            vorp
          FROM PlayerAdvanced
          WHERE player_id = '${id}' AND tm <> 'TOT'
          ORDER BY CAST(season AS INT) ASC;
        `;
        const advancedStatsResult = await executeQuery(advancedStatsQuery);
        setAdvancedStats(advancedStatsResult);

        // Fetch Playoff Stats from PlayerPlayoffStats (if file exists) or PlayerPerGame (if playoff data embedded)
        // For now, assume PlayerPlayoffStats will contain playoff data if available.
        const playoffStatsQuery = `
            SELECT
                season,
                lg,
                tm,
                g,
                gs,
                mp_per_game AS mp,
                fg_percent AS "fg_pct",
                x3p_percent AS "3p_pct",
                ft_percent AS "ft_pct",
                trb_per_game AS trb,
                ast_per_game AS ast,
                stl_per_game AS stl,
                blk_per_game AS blk,
                pts_per_game AS pts
            FROM PlayerPlayoffStats
            WHERE player_id = '${id}' AND tm <> 'TOT'
            ORDER BY CAST(season AS INT) ASC;
        `;
        const playoffStatsResult = await executeQuery(playoffStatsQuery);
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

  const requestSort = (key) => {
    let direction = 'ascending';
    // If the sort key is already set and direction is ascending, change to descending
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedData = (data, sortConf) => {
    if (!data || data.length === 0) return [];
    if (!sortConf.key) return data; // No sorting applied if no key specified

    return [...data].sort((a, b) => {
      const aValue = a[sortConf.key];
      const bValue = b[sortConf.key];

      // Handle null/undefined values by placing them at the end for ascending, beginning for descending
      if (aValue === null || aValue === undefined) return sortConf.direction === 'ascending' ? 1 : -1;
      if (bValue === null || bValue === undefined) return sortConf.direction === 'ascending' ? -1 : 1;

      // Handle string comparison (for alphabetical sorting)
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConf.direction === 'ascending'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      } else {
        // Handle numeric comparison
        return sortConf.direction === 'ascending'
          ? aValue - bValue
          : bValue - aValue;
      }
    });
  };

  const formatHeader = (header) => {
    // Convert snake_case or specific abbreviations to more readable format
    switch (header) {
      case 'mp_per_game': return 'MPG';
      case 'fg_pct': return 'FG%';
      case '3p_pct': return '3P%';
      case 'ft_pct': return 'FT%';
      case 'trb_per_game': return 'TRB';
      case 'ast_per_game': return 'AST';
      case 'stl_per_game': return 'STL';
      case 'blk_per_game': return 'BLK';
      case 'pts_per_game': return 'PTS';
      case 'mp_total': return 'MP';
      case 'fg_total': return 'FG';
      case 'fga_total': return 'FGA';
      case '3p_total': return '3P';
      case '3pa_total': return '3PA';
      case 'ft_total': return 'FT';
      case 'fta_total': return 'FTA';
      case 'orb_total': return 'ORB';
      case 'drb_total': return 'DRB';
      case 'tov_total': return 'TOV';
      case 'pf_total': return 'PF';
      case 'pts_total': return 'PTS';
      case 'mp_advanced': return 'MP';
      case 'ts_pct': return 'TS%';
      case '3p_ar': return '3PAr';
      case 'ft_ar': return 'FTr';
      case 'orb_pct': return 'ORB%';
      case 'drb_pct': return 'DRB%';
      case 'trb_pct': return 'TRB%';
      case 'ast_pct': return 'AST%';
      case 'stl_pct': return 'STL%';
      case 'blk_pct': return 'BLK%';
      case 'tov_pct': return 'TOV%';
      case 'usg_pct': return 'USG%';
      case 'ws_per_48': return 'WS/48';
      case 'ows': return 'OWS';
      case 'dws': return 'DWS';
      case 'ws': return 'WS';
      case 'obpm': return 'OBPM';
      case 'dbpm': return 'DBPM';
      case 'bpm': return 'BPM';
      case 'vorp': return 'VORP';
      case 'g': return 'G';
      case 'gs': return 'GS';
      case 'season': return 'Season';
      case 'lg': return 'Lg';
      case 'tm': return 'Tm';
      case 'per': return 'PER';
      case 'pos': return 'Pos';
      default: return header.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    }
  };

  const formatValue = (key, value) => {
    // Format percentages and other float values to 3 decimal places or 1 for per-game stats
    const threeDecimalKeys = ['fg_pct', '3p_pct', 'ft_pct', 'e_fg_percent', 'ts_pct', '3p_ar', 'ft_ar', 'orb_pct', 'drb_pct', 'trb_pct', 'ast_pct', 'stl_pct', 'blk_pct', 'tov_pct', 'usg_pct', 'ws_per_48', 'per', 'bpm', 'obpm', 'dbpm', 'vorp', 'pace', 'srs', 'o_rtg', 'd_rtg', 'n_rtg', 'mov'];
    const oneDecimalKeys = ['pts', 'trb', 'ast', 'stl', 'blk', 'mp', 'fg', 'fga', '3p', '3pa', 'ft', 'fta', 'orb', 'drb', 'tov', 'pf'];

    if (typeof value === 'number') {
      if (threeDecimalKeys.includes(key)) {
        return value.toFixed(3);
      }
      if (oneDecimalKeys.includes(key)) {
        return value.toFixed(1);
      }
      return value;
    }
    return value;
  };


  const renderPlayerInfo = () => {
    if (!playerInfo) return <p>Player information not found.</p>;
    return (
      <div style={{ marginBottom: '20px' }}>
        <h2>{playerInfo.full_name}</h2>
        <p>Position: {playerInfo.Pos || 'N/A'} | Height: {playerInfo.Ht || 'N/A'} | Weight: {playerInfo.Wt || 'N/A'}</p>
        <p>Born: {playerInfo["Date of Birth"] || 'N/A'} | College: {playerInfo.College || 'N/A'} | Draft: {playerInfo.Draft || 'N/A'}</p>
      </div>
    );
  };

  const renderCareerSummary = () => {
    if (!careerStats) return <p>Career summary not available.</p>;
    // Ensure all stats exist before displaying
    const hasStats = careerStats.G || careerStats.PTS || careerStats.TRB || careerStats.AST;
    if (!hasStats) return <p>Career summary incomplete.</p>;

    return (
      <div style={{ marginBottom: '20px' }}>
        <h3>Career Summary</h3>
        <p>Seasons: {careerStats.Yrs || 'N/A'}</p>
        <p>Games: {careerStats.G || 'N/A'}</p>
        <p>Total Points: {careerStats.PTS ? careerStats.PTS.toLocaleString() : 'N/A'}</p> {/* Use toLocaleString for large numbers */}
        <p>Total Rebounds: {careerStats.TRB ? careerStats.TRB.toLocaleString() : 'N/A'}</p>
        <p>Total Assists: {careerStats.AST ? careerStats.AST.toLocaleString() : 'N/A'}</p>
        <p>Win Shares: {careerStats.WS ? careerStats.WS.toFixed(1) : 'N/A'}</p>
      </div>
    );
  };

  const renderStatsTable = (data, title) => {
    if (!data || data.length === 0) return <h3>{title} Stats Not Available</h3>;

    // Filter out internal/redundant keys and order them logically for display
    const excludedKeys = ['player_id', 'seas_id', 'birth_year', 'experience', 'column0', 'column1', '__mopp__', 'player_name', 'player']; // 'player_name' already used for link
    let headers = Object.keys(data[0]).filter(key => !excludedKeys.includes(key.toLowerCase()));

    // Prioritize key stats for order, then sort remaining alphabetically
    const preferredOrderMap = {
      'season': 1, 'sm': 2, 'lg': 3, 'tm': 4, 'pos': 5, 'age': 6,
      'g': 7, 'gs': 8, 'mp': 9, 'fg': 10, 'fga': 11, 'fg_pct': 12, '3p': 13, '3pa': 14, '3p_pct': 15,
      '2p': 16, '2pa': 17, '2p_pct': 18, 'e_fg_percent': 19, 'ft': 20, 'fta': 21, 'ft_pct': 22,
      'orb': 23, 'drb': 24, 'trb': 25, 'ast': 26, 'stl': 27, 'blk': 28, 'tov': 29, 'pf': 30, 'pts': 31,
      // For Advanced stats
      'per': 32, 'ts_pct': 33, '3p_ar': 34, 'ft_ar': 35, 'orb_pct': 36, 'drb_pct': 37, 'trb_pct': 38,
      'ast_pct': 39, 'stl_pct': 40, 'blk_pct': 41, 'tov_pct': 42, 'usg_pct': 43, 'ows': 44, 'dws': 45,
      'ws': 46, 'ws_per_48': 47, 'obpm': 48, 'dbpm': 49, 'bpm': 50, 'vorp': 51
    };

    headers.sort((a, b) => {
      const orderA = preferredOrderMap[a.toLowerCase()] || 1000; // Put unlisted at end
      const orderB = preferredOrderMap[b.toLowerCase()] || 1000;
      if (orderA === orderB) {
        return a.localeCompare(b);
      }
      return orderA - orderB;
    });

    const currentSortedData = sortedData(data, sortConfig);

    return (
      <div style={{ marginBottom: '20px' }}>
        <h3>{title}</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {headers.map((header) => (
                  <th
                    key={header}
                    style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left', cursor: 'pointer' }}
                    onClick={() => requestSort(header)}
                  >
                    {formatHeader(header)}{sortConfig.key === header ? (sortConfig.direction === 'ascending' ? ' ▲' : ' ▼') : ''}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentSortedData.map((row, index) => (
                <tr key={index}>
                  {headers.map((header) => (
                    <td key={header} style={{ border: '1px solid #ddd', padding: '8px' }}>
                      {header === 'season' && row.tm
                        ? <Link to={`/teams/${row.tm}/${row.season}`}>{row[header]}</Link>
                        : formatValue(header, row[header])}
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
      {careerStats ? renderCareerSummary() : <p>Career summary not available.</p>}

      <div style={{ marginBottom: '10px' }}>
        <button onClick={() => { setActiveTab('perGame'); setSortConfig({ key: null, direction: 'ascending' }); }} style={{ marginRight: '5px' }}>Per Game</button>
        <button onClick={() => { setActiveTab('totals'); setSortConfig({ key: null, direction: 'ascending' }); }} style={{ marginRight: '5px' }}>Totals</button>
        <button onClick={() => { setActiveTab('advanced'); setSortConfig({ key: null, direction: 'ascending' }); }} style={{ marginRight: '5px' }}>Advanced</button>
        <button onClick={() => { setActiveTab('playoffs'); setSortConfig({ key: null, direction: 'ascending' }); }} style={{ marginRight: '5px' }}>Playoffs</button>
      </div>

      {activeTab === 'perGame' && renderStatsTable(perGameStats, 'Regular Season Stats (Per Game)')}
      {activeTab === 'totals' && renderStatsTable(totalStats, 'Regular Season Stats (Totals)')}
      {activeTab === 'advanced' && renderStatsTable(advancedStats, 'Regular Season Stats (Advanced)')}
      {activeTab === 'playoffs' && renderStatsTable(playoffStats, 'Playoff Stats')}
    </div>
  );
};

export default PlayerPage;