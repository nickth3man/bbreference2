# Basketball Development Context

## Current Context (August 1, 2025)
- Today's date: August 1, 2025
- Current NBA season: 2024-25 season ended in June 2025
- Next season: 2025-26 NBA season starts October 21, 2025
- **Basketball-Reference.com is the authoritative source of truth for all NBA data, statistics, and formatting standards**

## Basketball Data Standards
- Always use Basketball-Reference.com player IDs (e.g., `jamesle01` for LeBron James)
- Season format: Use YYYY for the ending year (e.g., 2024 for 2023-24 season)
- Team codes: Use standard 3-letter abbreviations (LAL, BOS, GSW, etc.)
- Stats should match Basketball-Reference.com precision and calculation methods

## Data Validation Rules
- Points, rebounds, assists totals must be non-negative integers
- **Per-game stats must ALWAYS be displayed as decimals (e.g., 0.9, 3.3, 4.1) never as whole numbers**
- Games played cannot exceed 82 for regular season
- Percentages should be stored as decimals (0.0 to 1.0)
- Minutes played cannot exceed 48 per game
- Validate player birthdates are reasonable (1920-2010 range)

## UI/UX Basketball-Specific Guidelines
- Player names should link to their detail pages
- Team names should link to franchise pages
- Use consistent color schemes for teams (Lakers purple/gold, Celtics green, etc.)
- Display stats with appropriate precision (PPG to 1 decimal, FG% to 3 decimals)
- **CRITICAL: All per-game stats must be formatted as decimals with 1 decimal place (e.g., 7.0, 12.5, 0.9) - NEVER display as whole numbers even if the value is a round number**
- Show career highs and season totals prominently
- Include contextual information (rookie seasons, All-Star appearances, etc.)
- **Tables must exactly match Basketball-Reference.com styling:**
  - Alternating row colors: white (#ffffff) and light gray (#f0f0f0)
  - Right-aligned numeric columns with consistent decimal places
  - Left-aligned text columns (Season, Team, Player names)
  - Sticky table headers when scrolling
  - Sortable columns with arrow indicators (▲▼)
  - Row hover effects (#e6f3ff background)
  - Bold headers with proper contrast
  - Consistent padding: 4px horizontal, 2px vertical
  - Font: Arial/Helvetica sans-serif family
  - Export to CSV button for each table

## Performance Considerations
- Cache frequently accessed player/team data
- Paginate large stat tables (season leaders, all-time records)
- Preload common queries (career stats, season averages)
- Use indexes on player_id, team_id, and season columns

## Testing Basketball Data
- Use real NBA players and teams in test data when possible
- Test edge cases: trades mid-season, injured players, rookie seasons
- Validate stat calculations match official NBA/Basketball-Reference totals
- Test historical data accuracy (especially pre-1980 seasons)
