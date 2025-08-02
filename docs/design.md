# UI Design for Local Basketball Reference Stats App

This document outlines the core UI components and navigation for the "Local Basketball Reference Stats App," mirroring the functionality and structure of Basketball-Reference.com. The design prioritizes a familiar user experience, intuitive navigation, and responsive layouts for various screen sizes.

## 1. Main UI Sections & Pages

The application will feature the following primary sections and their corresponding detailed pages, directly inspired by Basketball-Reference.com:

*   **Players:**
    *   **Players Index Page (`/players`):**
        *   An alphabetical index (A-Z tabs/filters) for efficient searching.
        *   Lists all players, with active players in bold and Hall of Famers marked with an asterisk (where data allows).
        *   Search bar for quick player lookup.
        *   Links to individual player pages.
    *   **Individual Player Page (`/players/:id`):**
        *   Displays player bio information (height, draft info, etc., if available).
        *   Multiple stats tables:
            *   Regular Season Stats (per-game, totals, advanced metrics).
            *   Playoff Stats (per-game, totals, advanced metrics).
        *   Tables can be presented in vertically stacked sections (similar to BRef) or via tabs for a cleaner UI on smaller screens.
        *   Career totals/averages summarizing all seasons.
        *   Playoff performance per year if series data is available.

*   **Teams:**
    *   **Teams Index Page (`/teams`):**
        *   Lists all NBA and defunct ABA/BAA franchises.
        *   Includes summary information (e.g., years active, cumulative W-L record).
        *   Links to individual Team Franchise Pages.
    *   **Team Franchise Page (`/teams/:teamId`):**
        *   Overview of the team's history.
        *   Table listing all seasons for the franchise with key details (year, record, coach).
        *   Links to specific Team Season Pages.
        *   Optionally displays franchise totals and championships.
    *   **Team Season Page (`/teams/:teamId/:year`):**
        *   Roster stats table for that specific season (per-game averages for all players on the team).
        *   Team totals and league rankings for that season.
        *   Summary of the season (champion, playoff result, if applicable).
        *   Navigation links to previous/next season for the same team and back to the franchise page.

*   **Seasons:**
    *   **Season Summary Page (`/seasons/:year`):**
        *   Displays final standings for East/West conferences.
        *   League leaders in various statistical categories for that season.
        *   Links to the Playoff Bracket for that year.
        *   Awards (optional, depending on data availability).

*   **Drafts:**
    *   **Drafts Index Page (`/drafts`):**
        *   Lists all NBA Draft years.
        *   Possibly includes the #1 pick for each year as a teaser.
        *   Links to individual Draft Pages.
    *   **Individual Draft Page (`/drafts/:year`):**
        *   Lists all draft picks for the specified year, organized by round and pick number.
        *   Includes columns for team and player (and college, if available).
        *   Hyperlinks player names to their individual player pages and team names to team pages.

*   **Playoffs:**
    *   **Playoff Bracket by Year Page (`/playoffs/:year`):**
        *   Visual representation or summarized list of series outcomes for the specified year's playoffs.
        *   Can be integrated into the Season Summary Page or be a standalone page.
    *   **Player Playoff Stats (Integrated into Player Page):**
        *   Separate stats tables for playoff performance, year by year, on individual player pages.
    *   **Championships/Finals Page (Optional):**
        *   List of NBA champions by year, derived from playoff data.

*   **League Leaders & Records (Optional, but planned for):**
    *   **Career Leaders Page (`/leaders/career`):**
        *   All-time leaders in major statistical categories (points, rebounds, assists, etc.).
    *   **Single-Season Records Page (`/records/season`):**
        *   Records for individual categories within a single season.

## 2. Navigational Structure

The application will feature a clear and intuitive navigation menu, similar to Basketball-Reference.com, primarily located at the top of the interface. This will be implemented using React Router for seamless client-side page transitions.

**Global Navigation Bar:**
*   **Home/Logo:** Navigates to the main landing page (e.g., `/`).
*   **Players:** Links to [Players Index Page](docs/design.md#players-index-page-players).
*   **Teams:** Links to [Teams Index Page](docs/design.md#teams-index-page-teams).
*   **Seasons:** Links to a [Seasons Index Page](docs/design.md#2-navigational-structure) (potentially a dropdown with years) or directly to the current/most recent season.
*   **Drafts:** Links to [Drafts Index Page](docs/design.md#drafts-index-page-drafts).
*   **Playoffs:** Links to a [Playoffs Index Page](docs/design.md#2-navigational-structure) or current/most recent playoff bracket.
*   **Search Bar:** Global search functionality for players, teams, etc.

**Drill-down Navigation:** Users will navigate from index pages to specific content through hyperlinks within tables and lists.

**Example React Routes:**

*   `/` - Home/Landing Page
*   `/players` - Players Index
*   `/players/:id` - Individual Player Page
*   `/teams` - Teams Index
*   `/teams/:teamId` - Team Franchise Page
*   `/teams/:teamId/:year` - Team Season Page
*   `/seasons/:year` - Season Summary Page
*   `/drafts` - Drafts Index
*   `/drafts/:year` - Individual Draft Page
*   `/playoffs/:year` - Playoff Bracket by Year Page
*   `/leaders/career` - Career Leaders Page
*   `/records/season` - Single-Season Records Page

## 3. Player Page Layout (Example)

**(Sketch/Wireframe-like Description)**

```
+-------------------------------------------------------------+
| [Header]                                                    |
|  [Logo]                       [Nav Menu: Players Teams ...] |
+-------------------------------------------------------------+
| [Search Bar]                                                |
+-------------------------------------------------------------+
| Player Name (e.g., LeBron James)                            |
| ----------------------------------                          |
| [Player Photo]                                              |
| Bio Information:                                            |
|   Position: SF | Height: 6'9" | Weight: 250 lbs             |
|   Born: 12/30/1984 | College: n/a | Draft: 2003, R1, P1     |
|   ...                                                       |
+-------------------------------------------------------------+
| Career Summary: [Total Seasons Played] [Career PPG] [...]   |
+-------------------------------------------------------------+
| Tab/Section Nav (if using tabs):                            |
| [Regular Season] [Playoffs] [Advanced] [Shooting]           |
+-------------------------------------------------------------+
| Table 1: Regular Season Stats (Per Game)                    |
| ----------------------------------------------------------- |
| | Season | Team | G | GS | MPG | FG% | 3P% | FT% | RPG | APG | SPG | BPG | PPG |
| |-------|------|---|----|-----|-----|-----|-----|-----|-----|-----|-----|-----|
| | 2003-04| CLE  | 79| 79 | 39.5| .417| .290| .754| 5.5 | 5.9 | 1.6 | 0.7 | 20.9|
| | ...                                                       |
| +-----------------------------------------------------------+
| | Career Average/Total: ...                                 |
+-------------------------------------------------------------+
| Table 2: Regular Season Stats (Totals)                      |
| ----------------------------------------------------------- |
| | Season | Team | G | GS | FGM | FGA | 3PM | 3PA | FTM | FTA | TRB | AST | STL | BLK | PTS |
| |-------|------|---|----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|
| | 2003-04| CLE  | 79| 79 | 622 | 1494| 83  | 285 | 338 | 443 | 432 | 482 | 129 | 58  | 1654|
| | ...                                                       |
| +-----------------------------------------------------------+
| | Career Total: ...                                         |
+-------------------------------------------------------------+
| Table 3: Playoff Stats (Per Game - if available)            |
| ----------------------------------------------------------- |
| | Season | Team | G | GS | MPG | FG% | 3P% | FT% | RPG | APG | SPG | BPG | PPG |
| |-------|------|---|----|-----|-----|-----|-----|-----|-----|-----|-----|-----|
| | 2005-06| CLE  | 13| 13 | 46.5| .476| .333| .737| 8.1 | 5.8 | 1.4 | 0.7 | 30.8|
| | ...                                                       |
| +-----------------------------------------------------------+
| | Career Playoff Total: ...                                 |
+-------------------------------------------------------------+
| [Footer]                                                    |
+-------------------------------------------------------------+
```
**Layout Notes:**
*   **Bio Info:** Prominently displayed at the top, possibly next to a player image.
*   **Stats Tables:** Multiple tables will be presented. The choice between stacked vertically and tabs will consider screen size. For larger screens, stacking allows immediate comparison. For smaller screens, tabs provide a cleaner, less cluttered view, requiring user interaction to switch between categories. The default view could be "Per Game" stats.
*   **Career Summary:** A concise summary row or section immediately below bio info.

## 4. Interactivity

To enhance user experience and leverage the local DuckDB capabilities, the following interactive elements are proposed:

*   **Table Sorting:**
    *   All numeric tables (player stats, team standings, draft picks) will allow sorting by any column. Clicking a column header will sort the data in ascending/descending order.
    *   This will trigger immediate DuckDB queries to re-sort the data client-side.
*   **Data Filtering (Season Range):**
    *   On player pages and team franchise/season pages, users can filter data by season range (e.g., a "From Year" and "To Year" input or slider).
    *   This will dynamically update the displayed tables by re-querying DuckDB-WASM.
*   **Stat Category Toggles/Dropdowns:**
    *   On player and team season pages, users can switch between "Per Game," "Totals," "Advanced," and "Playoff" stats via tabs or dropdown menus. Each selection will trigger a specific DuckDB query.
*   **Search Functionality:**
    *   A global search bar in the header for quick lookup of players and teams by name.
    *   This will initiate a DuckDB `LIKE` query on relevant tables (e.g., `Players` table).
*   **Table Export:**
    *   An "Export CSV" button (similar to BRef) to allow users to download the currently displayed table data as a CSV file. This will leverage DuckDB's export capabilities or client-side CSV generation.

## 5. Responsiveness

The UI will be designed to be fully responsive, ensuring a usable and aesthetically pleasing experience across various devices and screen sizes (desktops, tablets, mobile phones). Following Webflow's responsive design guidelines will be crucial.

*   **Fluid Layouts:** Use flexible grid systems (e.g., CSS Grid or Flexbox) to allow components to resize and reflow based on viewport width.
*   **Breakpoints:** Define specific breakpoints for different screen sizes (e.g., mobile, tablet, desktop) to adjust layouts, font sizes, and component visibility.
    *   **Mobile (smaller screens):**
        *   Navigation: Collapse into a hamburger menu or bottom navigation bar for main sections.
        *   Tables: Implement horizontal scrolling for wider statistical tables to prevent content overflow. Critical columns should be pinned or prioritized. Alternatively, a "card" view for each row could be considered, displaying key stats vertically.
        *   Player Page: Tabs for stat categories are preferred over vertically stacked tables to conserve vertical space. Bio information might stack vertically.
    *   **Tablet:**
        *   Navigation: Could be a side drawer or a condensed top menu.
        *   Tables: May still require horizontal scrolling for larger tables.
    *   **Desktop:**
        *   Navigation: Full top navigation bar.
        *   Tables: Full-width tables with all columns visible.
        *   Player Page: Vertically stacked tables for different stat categories are feasible, allowing for easy overview.
*   **Image Optimization:** Use responsive images (e.g., `srcset`) to serve appropriately sized images based on the device.
*   **Font Sizes:** Adjust font sizes responsively using `rem` or `em` units to maintain readability.
*   **Touch Targets:** Ensure interactive elements (buttons, links, sortable column headers) have adequate touch target sizes for mobile users.

```mermaid
graph TD
    A[User Opens App] --> B(Splash/Loading Screen - DuckDB Init)
    B --> C{Main Navigation}
    C --> D[Players Index]
    D -- Click Player --> E[Individual Player Page]
    E -- Sort Table / Filter Seasons --> E
    C --> F[Teams Index]
    F -- Click Team Franchise --> G[Team Franchise Page]
    G -- Click Team Season --> H[Team Season Page]
    H -- Sort Roster / Filter Stats --> H
    C --> I[Seasons Index / Dropdown]
    I -- Select Year --> J[Season Summary Page]
    J -- View Standings / Leaders --> J
    J -- Click Playoff Link --> K[Playoff Bracket by Year]
    C --> L[Drafts Index]
    L -- Select Year / Click Year --> M[Individual Draft Page]
    M -- Click Player --> E
    M -- Click Team --> G
    C --> N[Leaderboards / All-Time Records (Optional)]
    N -- Filter / Sort --> N
```

**Assumptions:**
*   **DuckDB-WASM Performance:** Assumed that DuckDB-WASM can handle real-time sorting and filtering queries on client-side datasets with sub-second response times, enabling a smooth interactive experience.
*   **Data Completeness:** Assumed that `.csv` files contain sufficient data points (player IDs, team IDs, season details, and all required statistical categories) to replicate BRef's numeric tables and factual content comprehensively. Any missing data (e.g., detailed award winners, intricate playoff series results not derivable from game logs) would result in those specific elements being omitted or simplified.
*   **No User Accounts/Auth:** The application is purely for local stats browsing; no user authentication, data input, or personalized features are required.
*   **Minimal Custom Styling:** Primary styling may originate from a Webflow template, with React components adapting to and injecting data into this base. Extensive custom CSS beyond what helps with responsiveness or specific interaction feedback is not within scope.
*   **Static Data:** The CSV data is considered static and loaded once. There is no mechanism for updating or adding new data within the app's UI.
*   **Client-Side Routing:** React Router (or similar) will manage all navigation to ensure a Single Page Application (SPA) experience without full page reloads.