import React, { useState } from 'react';
import StatsTable from '../../components/StatsTable';
import useQuery from '../../hooks/useQuery';

const StatsTableDemo = () => {
  // Demo data - LeBron James career stats
  const demoData = [
    { 
      season: '2023-24', team: 'LAL', games: 71, games_started: 71,
      minutes: 35.3, fg_pct: 0.540, three_pct: 0.410, ft_pct: 0.750,
      ppg: 25.7, rpg: 7.3, apg: 8.3, spg: 1.3, bpg: 0.5,
      total_points: 1825, total_rebounds: 518, total_assists: 589
    },
    { 
      season: '2022-23', team: 'LAL', games: 55, games_started: 54,
      minutes: 35.5, fg_pct: 0.506, three_pct: 0.321, ft_pct: 0.768,
      ppg: 28.9, rpg: 8.3, apg: 6.8, spg: 0.9, bpg: 0.6,
      total_points: 1590, total_rebounds: 457, total_assists: 374
    },
    { 
      season: '2021-22', team: 'LAL', games: 56, games_started: 56,
      minutes: 37.2, fg_pct: 0.524, three_pct: 0.359, ft_pct: 0.756,
      ppg: 30.3, rpg: 8.2, apg: 6.2, spg: 1.3, bpg: 1.1,
      total_points: 1695, total_rebounds: 459, total_assists: 349
    },
    { 
      season: '2020-21', team: 'LAL', games: 45, games_started: 45,
      minutes: 33.4, fg_pct: 0.513, three_pct: 0.365, ft_pct: 0.698,
      ppg: 25.0, rpg: 7.7, apg: 7.8, spg: 1.1, bpg: 0.6,
      total_points: 1126, total_rebounds: 346, total_assists: 352
    },
    { 
      season: '2019-20', team: 'LAL', games: 67, games_started: 67,
      minutes: 34.6, fg_pct: 0.493, three_pct: 0.348, ft_pct: 0.693,
      ppg: 25.3, rpg: 7.8, apg: 10.2, spg: 1.2, bpg: 0.5,
      total_points: 1698, total_rebounds: 525, total_assists: 684
    }
  ];

  // Column definitions for different tables
  const perGameColumns = [
    { key: 'season', label: 'Season', type: 'text', sortable: true },
    { key: 'team', label: 'Team', type: 'link', sortable: true, linkPath: (value) => `/teams/${value.toLowerCase()}` },
    { key: 'games', label: 'G', type: 'numeric', sortable: true, decimals: 0 },
    { key: 'games_started', label: 'GS', type: 'numeric', sortable: true, decimals: 0, mobileHide: true },
    { key: 'minutes', label: 'MP', type: 'numeric', sortable: true, decimals: 1, mobileHide: true },
    { key: 'fg_pct', label: 'FG%', type: 'numeric', sortable: true, decimals: 3, mobileHide: true },
    { key: 'three_pct', label: '3P%', type: 'numeric', sortable: true, decimals: 3, mobileHide: true },
    { key: 'ft_pct', label: 'FT%', type: 'numeric', sortable: true, decimals: 3, mobileHide: true },
    { key: 'ppg', label: 'PPG', type: 'numeric', sortable: true, decimals: 1 },
    { key: 'rpg', label: 'RPG', type: 'numeric', sortable: true, decimals: 1 },
    { key: 'apg', label: 'APG', type: 'numeric', sortable: true, decimals: 1 },
    { key: 'spg', label: 'SPG', type: 'numeric', sortable: true, decimals: 1, mobileHide: true },
    { key: 'bpg', label: 'BPG', type: 'numeric', sortable: true, decimals: 1, mobileHide: true }
  ];

  const totalsColumns = [
    { key: 'season', label: 'Season', type: 'text', sortable: true },
    { key: 'team', label: 'Team', type: 'link', sortable: true, linkPath: (value) => `/teams/${value.toLowerCase()}` },
    { key: 'games', label: 'G', type: 'numeric', sortable: true, decimals: 0 },
    { key: 'total_points', label: 'PTS', type: 'numeric', sortable: true, decimals: 0 },
    { key: 'total_rebounds', label: 'TRB', type: 'numeric', sortable: true, decimals: 0 },
    { key: 'total_assists', label: 'AST', type: 'numeric', sortable: true, decimals: 0 }
  ];

  // Mock sorting state
  const [sortConfig, setSortConfig] = useState({ key: 'season', direction: 'desc' });
  
  const handleRequestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Sort data based on current config
  const sortedData = [...demoData].sort((a, b) => {
    if (a[sortConfig.key] === null || a[sortConfig.key] === undefined) return 1;
    if (b[sortConfig.key] === null || b[sortConfig.key] === undefined) return -1;
    
    let aVal = a[sortConfig.key];
    let bVal = b[sortConfig.key];
    
    if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase();
      bVal = bVal.toLowerCase();
    }
    
    if (aVal < bVal) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (aVal > bVal) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>StatsTable Component Demo</h1>
      
      <section style={{ marginBottom: '40px' }}>
        <h2>Player Per Game Stats</h2>
        <p>Example showing LeBron James' recent seasons with proper formatting:</p>
        <ul>
          <li>Per-game stats show with 1 decimal place (e.g., 25.7)</li>
          <li>Percentages show with 3 decimal places (e.g., 0.540)</li>
          <li>Totals show as integers (e.g., 71)</li>
          <li>Click headers to sort</li>
          <li>Team names are clickable links</li>
        </ul>
        
        <StatsTable
          data={sortedData}
          columns={perGameColumns}
          sortConfig={sortConfig}
          requestSort={handleRequestSort}
          exportable={true}
          exportFilename="lebron_per_game"
          caption="LeBron James Career Stats - Per Game"
          mobileColumns={['season', 'team', 'games', 'ppg', 'rpg', 'apg']}
        />
      </section>

      <section style={{ marginBottom: '40px' }}>
        <h2>Player Season Totals</h2>
        <p>Same data showing season totals instead of per-game averages:</p>
        
        <StatsTable
          data={sortedData}
          columns={totalsColumns}
          sortConfig={sortConfig}
          requestSort={handleRequestSort}
          exportable={true}
          exportFilename="lebron_totals"
          caption="LeBron James Career Stats - Totals"
        />
      </section>

      <section style={{ marginBottom: '40px' }}>
        <h2>Empty State</h2>
        <p>Table with no data:</p>
        
        <StatsTable
          data={[]}
          columns={perGameColumns}
          sortConfig={sortConfig}
          requestSort={handleRequestSort}
          exportable={false}
        />
      </section>

      <section style={{ marginBottom: '40px' }}>
        <h2>Missing Data Handling</h2>
        <p>Table with null/undefined values showing as dashes:</p>
        
        <StatsTable
          data={[
            { season: '2023-24', team: 'LAL', games: null, ppg: undefined, rpg: '', apg: 8.3 },
            { season: '2022-23', team: 'LAL', games: 55, ppg: 28.9, rpg: 8.3, apg: null }
          ]}
          columns={[
            { key: 'season', label: 'Season', type: 'text' },
            { key: 'team', label: 'Team', type: 'text' },
            { key: 'games', label: 'G', type: 'numeric', decimals: 0 },
            { key: 'ppg', label: 'PPG', type: 'numeric', decimals: 1 },
            { key: 'rpg', label: 'RPG', type: 'numeric', decimals: 1 },
            { key: 'apg', label: 'APG', type: 'numeric', decimals: 1 }
          ]}
          sortConfig={{ key: 'season', direction: 'desc' }}
          requestSort={() => {}}
          exportable={false}
        />
      </section>

      <section>
        <h2>Notes on Basketball-Reference Styling</h2>
        <ul>
          <li>Font: Arial, Helvetica, sans-serif (12px table, 11px cells)</li>
          <li>Alternating rows: white (#ffffff) and light gray (#f0f0f0)</li>
          <li>Hover effect: light blue (#e6f3ff)</li>
          <li>Headers: sticky with gray background (#f0f0f0)</li>
          <li>Borders: 1px solid #ccc</li>
          <li>Sort arrows: ▲ (ascending) ▼ (descending)</li>
          <li>Links: blue (#0066cc) with underline on hover</li>
        </ul>
      </section>
    </div>
  );
};

export default StatsTableDemo;