
# Project Context: BBReference2

## Project Overview (August 1, 2025)
> ⚠️ **Date Verification Required**: Use `/date:verify` command to update current date context with web search
This project creates a local Basketball Reference stats app that mirrors Basketball-Reference.com functionality using React and DuckDB-WASM. 
- **Basketball-Reference.com is the authoritative source of truth for all NBA data and statistical standards**
- Current date: August 1, 2025
- 2025-26 NBA season starts: October 21, 2025
- Data spans from 1946-present (BAA/NBA historical data)
- **Technology Stack**: React 18.2+, DuckDB-WASM 1.28+, React Router 6.22+, PapaParse 5.4+
- **Architecture**: Client-side SPA with offline-first DuckDB database and CSV data ingestion

## Coding Standards
- Use clear, descriptive names for variables, functions, and components.
- Write modular, reusable code. Prefer functional React components and hooks.
- Use 2-space indentation for all new files (JS/JSX/JSON/MD). For Python, follow PEP 8.
- Add JSDoc (or equivalent) comments for all exported functions and complex logic.
- Keep all code and comments in English.
- Use environment variables for sensitive or environment-specific configuration.
- **Basketball Reference IDs**: Always use Basketball-Reference.com player IDs (e.g., `jamesle01` for LeBron James)
- **Season Format**: Use YYYY for the ending year (e.g., 2024 for 2023-24 season)
- **Team Codes**: Use standard 3-letter abbreviations (LAL, BOS, GSW, etc.)
- **Decimal Formatting**: All per-game stats MUST display with exactly 1 decimal place (e.g., 7.0, 12.5, 0.9)

## Data & CSV Handling
- All CSV files must be placed in the `csv/` directory and referenced via relative paths.
- Document the schema (column names, types, and meaning) for each CSV file in `docs/` or as a code comment above the relevant loader function.
- Validate and sanitize all data loaded from CSVs. Handle missing, malformed, or unexpected data gracefully (never crash the app on bad data).
- When adding new CSVs, update the documentation and ingestion logic accordingly.
- **DuckDB Integration**: Use DuckDB-WASM for persistent data storage in browser's OPFS (Origin Private File System)
- **CSV Sources**: All data sourced from Basketball-Reference.com exports and official NBA statistics
- **Data Validation**: Points, rebounds, assists totals must be non-negative integers; games played cannot exceed 82 for regular season
- **Performance**: Cache frequently accessed player/team data; paginate large stat tables; use indexes on player_id, team_id, and season columns

## Testing
- All services, utility functions, and data loaders must have comprehensive unit tests.
- Use Jest for all JavaScript/React testing. Place tests alongside the code or in a `__tests__` subfolder.
- Mock external dependencies (e.g., DuckDB, fetch) in tests.
- Aim for high code coverage, especially for data transformation and business logic.
- **Basketball Data Testing**: Use real NBA players and teams in test data when possible
- **Edge Cases**: Test trades mid-season, injured players, rookie seasons, historical data accuracy
- **Statistical Validation**: Validate stat calculations match official NBA/Basketball-Reference totals
- **Component Testing**: Test Basketball Reference table styling, decimal formatting, sorting functionality

## UI/UX Guidelines
- Ensure the UI is responsive (works on desktop and mobile) and accessible (meets WCAG AA where practical).
- Use modern, clean design principles. Favor clarity and usability over visual complexity.
- Provide clear error messages and loading indicators for all async operations.
- Use semantic HTML and ARIA attributes where appropriate.
- **Tables must match Basketball-Reference.com styling:**
  - Alternating row colors (white/light gray stripes)
  - Sticky headers for long tables
  - Right-aligned numeric columns
  - Consistent column widths and padding
  - Sortable columns with clear indicators
  - Hover effects on rows for better UX

## Custom Gemini Commands
Available custom commands for this project:
- `/date:verify` - Verify and update current date context using web search
- `/test:gen` - Generate comprehensive test suites for components/services
- `/code:component` - Create React components with Basketball Reference styling
- `/code:service` - Generate service modules with proper error handling and documentation
- `/code:analysis` - Perform advanced code analysis with multiple inspection options
- `/data:schema` - Design DuckDB database schemas for basketball data
- `/data:query` - Generate optimized SQL queries for stats and analytics
- `/docs:api` - Create API documentation for data services
- `/ui:spec` - Generate UI component specifications with Basketball Reference styling

## .gemini Directory Structure
```
.gemini/
├── settings.json              # Core Gemini CLI configuration
├── .env                       # Environment variables
├── commands/                  # Custom commands
│   ├── code/
│   │   ├── component.toml     # React component generation
│   │   ├── service.toml       # Service module generation
│   │   └── analysis.toml      # Advanced code analysis
│   ├── data/
│   │   ├── schema.toml        # DuckDB schema design
│   │   └── query.toml         # SQL query generation
│   ├── docs/
│   │   └── api.toml           # API documentation
│   ├── test/
│   │   └── gen.toml           # Test generation
│   ├── ui/
│   │   └── spec.toml          # UI component specifications
│   └── date-verify.md         # Date verification command
└── extensions/
    └── basketball-dev/        # Basketball-specific extension
        ├── gemini-extension.json
        └── BASKETBALL_DEV.md
```

## Gemini CLI Configuration
- **Theme**: GitHub (clean, professional styling)
- **Auto Accept**: Disabled (manual approval for safety)
- **Sandbox**: Disabled (direct file system access)
- **Checkpointing**: Enabled (allows `/restore` command to undo changes)
- **Git Integration**: Respects .gitignore for file filtering
- **Extensions**: Basketball-dev extension loaded with specialized context
- **Commands**: 9 custom commands for development workflow
- **MCP Servers**: 7 configured servers for enhanced functionality:
  - `fetch-mcp`: Web content fetching and text processing
  - `sequentialthinking`: Advanced reasoning and problem-solving tools
  - `GitHub`: Repository search and code exploration
  - `context7`: Library documentation and context resolution
  - `brave-search`: Web search capabilities
  - `perplexity-mcp`: AI-powered search and documentation
  - `deepwiki`: Wikipedia and knowledge base access

## Project Structure & Conventions
- Place all React pages in `src/pages/`.
- Place all reusable UI components in `src/components/`.
- Place all services (e.g., DuckDB integration) in `src/services/`.
- Place all custom hooks in `src/hooks/`.
- Place all utility/helper functions in `src/utils/`.
- Place all CSV files in the `csv/` directory.
- Place documentation in the `docs/` directory.
- Use `public/` for static assets and `public/csv/` for serving CSVs in development.
- Keep the codebase organized and avoid duplication.

## Key Dependencies & Integration
- **@duckdb/duckdb-wasm**: ^1.28.0 - Main database engine for offline stats
- **react**: ^18.2.0 - UI framework with functional components and hooks
- **react-router-dom**: ^6.22.3 - Client-side routing for Basketball Reference pages
- **papaparse**: ^5.4.1 - CSV parsing (fallback and export functionality)
- **web-vitals**: ^2.1.4 - Performance monitoring

## Development Workflow
1. **Initialize Database**: Use `src/services/duckdbService.js` to set up DuckDB-WASM and ingest CSV data
2. **Create Components**: Use `/code:component` for Basketball Reference styled UI components
3. **Add Schemas**: Use `/data:schema` to design database tables for new data sources
4. **Generate Queries**: Use `/data:query` for optimized SQL queries with proper JOINs
5. **Write Tests**: Use `/test:gen` for comprehensive test coverage
6. **Document APIs**: Use `/docs:api` for service documentation
7. **Design Specs**: Use `/ui:spec` for detailed component specifications

## Contribution Process
- Before submitting a PR, ensure all tests pass and code is linted.
- Update documentation (including this file) when adding new features or data sources.
- Use descriptive commit messages and PR titles.
- Review open issues and reference them in your PR if applicable.

## Imports
@./README.md
@./architecture.md
@./PRD.md
@./docs/table-component-spec.md
@./docs/design.md
@./.gemini/extensions/basketball-dev/BASKETBALL_DEV.md