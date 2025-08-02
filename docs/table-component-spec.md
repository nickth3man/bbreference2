# Basketball Reference Table Component Specifications

## Data Source Authority
**Basketball-Reference.com is the definitive source of truth for all NBA statistics, formatting, and presentation standards. All components must exactly match their styling and data presentation.**

## Current Context (August 1, 2025)
- 2024-25 NBA season: Completed (June 2025)
- 2025-26 NBA season: Starts October 21, 2025
- Data coverage: 1946-present (BAA/NBA historical data)

## Table Styling Requirements

### Visual Design
```css
/* Base table styling to match Basketball-Reference.com */
.stats-table {
  font-family: Arial, Helvetica, sans-serif;
  font-size: 12px;
  border-collapse: collapse;
  width: 100%;
  margin: 10px 0;
}

/* Header styling */
.stats-table thead th {
  background-color: #f0f0f0;
  font-weight: bold;
  padding: 4px 8px 2px;
  border: 1px solid #ccc;
  text-align: center;
  position: sticky;
  top: 0;
  z-index: 10;
}

/* Sortable header indicators */
.stats-table thead th.sortable {
  cursor: pointer;
  user-select: none;
}

.stats-table thead th.sortable:hover {
  background-color: #e0e0e0;
}

.stats-table thead th .sort-arrow {
  margin-left: 4px;
  color: #666;
}

/* Row styling - alternating colors */
.stats-table tbody tr:nth-child(odd) {
  background-color: #ffffff;
}

.stats-table tbody tr:nth-child(even) {
  background-color: #f0f0f0;
}

.stats-table tbody tr:hover {
  background-color: #e6f3ff !important;
}

/* Cell styling */
.stats-table td {
  padding: 2px 4px;
  border: 1px solid #ccc;
  font-size: 11px;
}

/* Numeric columns - right aligned */
.stats-table td.numeric {
  text-align: right;
}

/* Text columns - left aligned */
.stats-table td.text {
  text-align: left;
}

/* Links in tables */
.stats-table a {
  color: #0066cc;
  text-decoration: none;
}

.stats-table a:hover {
  text-decoration: underline;
}
```

### Column Specifications

#### Standard Columns and Alignment
- **Season**: Left-aligned text (e.g., "2023-24")
- **Team**: Left-aligned text, should be clickable link
- **Player**: Left-aligned text, should be clickable link
- **G** (Games): Right-aligned integer
- **GS** (Games Started): Right-aligned integer
- **MP** (Minutes Played): Right-aligned decimal (1 place)
- **FG%** (Field Goal %): Right-aligned decimal (3 places)
- **3P%** (3-Point %): Right-aligned decimal (3 places)
- **FT%** (Free Throw %): Right-aligned decimal (3 places)
- **PPG** (Points Per Game): Right-aligned decimal (1 place)
- **RPG** (Rebounds Per Game): Right-aligned decimal (1 place)
- **APG** (Assists Per Game): Right-aligned decimal (1 place)

#### Data Formatting Rules
- **Per-game stats: ALWAYS 1 decimal place (e.g., 7.0, 12.5, 0.9) - never display as whole numbers**
- Percentages: Display as decimals with 3 decimal places (e.g., 0.456 not 45.6%)
- Totals: Integers (no decimals)
- Missing data: Display as empty cell or "-"

### Interactive Features

#### Sorting
- All numeric columns should be sortable
- Click header to sort ascending, click again for descending
- Show sort arrows (▲ for ascending, ▼ for descending)
- Default sort by Season (most recent first)

#### Export
- "Export to CSV" button above each table
- Should export exactly what's currently displayed (including any filters)
- Filename format: "PlayerStats_LeBronJames_20241201.csv"

### React Component Structure

```jsx
<StatsTable
  data={playerSeasonStats}
  columns={[
    { key: 'season', label: 'Season', type: 'text', sortable: true },
    { key: 'team', label: 'Team', type: 'link', sortable: true },
    { key: 'games', label: 'G', type: 'numeric', sortable: true },
    { key: 'ppg', label: 'PPG', type: 'numeric', decimals: 1, sortable: true },
    // ... more columns
  ]}
  sortBy="season"
  sortDirection="desc"
  exportable={true}
  exportFilename="player-stats"
/>
```

### Responsive Behavior
- On mobile: Hide less important columns first (GS, MP, advanced stats)
- Maintain core columns: Season, Team, G, PPG, RPG, APG
- Add horizontal scroll for full table on small screens
- Stack tables vertically on mobile rather than side-by-side

### Accessibility
- Proper table headers with scope attributes
- ARIA labels for sort buttons
- High contrast colors meeting WCAG AA standards
- Keyboard navigation support for sortable headers
