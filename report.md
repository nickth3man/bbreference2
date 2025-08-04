Comprehensive Report: bbreference2

Executive Summary
bbreference2 is a client-side, offline-first React application that mirrors Basketball-Reference’s statistics experience using DuckDB-WASM for in-browser analytics and persistent storage. The project demonstrates solid architectural separation (services/hooks/components), a reusable StatsTable component, and parameterized query patterns. Immediate improvements are needed to resolve correctness issues (sorting bug in PlayerPage, test-service API mismatch), fortify input handling and sortable-column safety, normalize CSV ingestion references, and increase test coverage. A two-week plan focuses on correctness/security first, then maintainability, performance, and developer workflow maturity. With modest resources (2–3 devs), the app can reach a robust, demo-ready state and scale toward a fuller feature set (leaders, filters, virtualization).

Technical Architecture Overview
- Frontend: React 18 SPA with React Router (src/App.js, src/pages/*). Shared UI via StatsTable (src/components/StatsTable.js, .css).
- Data Engine: DuckDB-WASM running in a Web Worker, using IndexedDB/OPFS persistence. Initialization and ingestion are orchestrated in src/services/duckdbService.js; queries via executeQuery().
- Hooks: useQuery() encapsulates data fetching and sorting, returns state and sort controls (src/hooks/useQuery.js).
- Data Source: CSVs under /csv; ingestion registers virtual files and creates normalized tables, with some explicit schemas (e.g., PlayerPerGame).
- Testing: Jest + React Testing Library; coverage for StatsTable; service tests need alignment with current API.
- Documentation: README (setup + component usage), docs/architecture.md (flows/components), docs/PRD.md (scope/design), table-component-spec.md.

Current State Assessment
Strengths
- Clear layering: services for data, hooks for state/querying, components for presentation.
- Reusable StatsTable with formatting and CSV export; responsive styling aligned to BRef patterns.
- Parameterized queries in pages; basic sort sanitation in useQuery. Persistence and indexes implemented in DuckDB.
- Comprehensive documentation of architecture and PRD.

Gaps and Risks
- Correctness: PlayerPage references undefined sortedData and implicit sort state; will cause runtime errors. Tests import non-existent service functions (initDB/query).
- Ingestion: Filename case/space mismatches (e.g., team_abbrev.csv vs CSV present as Team Abbrev.csv) risk broken loads depending on hosting/FS semantics.
- Security: Sorting sanitation relies on regex; needs a strict allow-list. Minimal validation on search strings and route params.
- Performance: useQuery uses JSON.stringify(params) in deps; may cause unnecessary re-runs. Ingestion is sequential; no progress UI.
- Tests: Missing hook/page/integration tests; service test mocks the wrong API.
- Ops: No CI, no manifest/hash-based update detection, limited visibility into DB persistence state.

Identified Opportunities and Challenges
Opportunities
- Unify sorting via useQuery with allow-listed columns; simplify pages.
- Decompose PlayerPage into dedicated hooks; improve reusability and testability.
- Add leaders, comparisons, advanced filtering, and saved views to match BRef UX.
- Parallelize ingestion and optionally use gzipped CSVs to reduce first-run latency.
- Introduce a data manifest (hashes/schema version) to detect changes and guide refresh.

Challenges
- Browser constraints (SharedArrayBuffer, OPFS behavior) vary by host and may limit multi-threaded WASM unless headers are configured.
- CSV schema drift: mismatches between CSVs and explicit schemas increase maintenance cost.
- Performance tuning: balancing virtualized tables and interactivity without overcomplicating UX.

Prioritized Action Plan with Timelines
Phase 1: Correctness and Security (Week 1)
1. Fix PlayerPage sorting/undefined functions
- Standardize on useQuery for sorting or add a local useSort hook consistently.
- Acceptance: No runtime errors; sorting operates via allow-list.

2. Align service tests with implementation
- Update duckdbService.test to use initializeDuckDB/executeQuery; add error-path tests.
- Acceptance: Tests pass, exercise both happy/error paths.

3. Harden useQuery
- Implement sortable column allow-lists; remove regex-only sanitation.
- Replace JSON.stringify(params) dep with a stable key/memoized params.
- Acceptance: Sorting keys constrained to allow-list; re-renders minimized.

4. Normalize CSV references
- Ensure ingestion filenames match repo casing/spaces (encodeURIComponent consistently).
- Acceptance: Ingestion succeeds across all core CSVs; clear errors for missing optionals.

Phase 2: Maintainability and Performance (Week 2)
5. Refactor ingestion
- Split createTablesAndIngestData into domain modules (players/teams/drafts/games/indexes).
- Add progress reporting signals and parallelize safe fetch/register steps.
- Acceptance: Code readability improved; progress UI in place; ingestion completes faster.

6. Shared formatting utilities
- Move numerical/percentage/per-game formatting to src/utils/formatters; apply in StatsTable/PlayerPage.
- Acceptance: Consistent decimals and display rules; reduced duplication.

7. Route code-splitting and optional virtualization
- Add React.lazy/Suspense to heavy routes; add a prop to enable react-window virtualization in StatsTable for large datasets.
- Acceptance: Initial bundle smaller; large tables scroll smoothly when enabled.

Phase 3: Quality and Operations (Week 2)
8. Testing and CI
- Add tests for useQuery, PlayersIndex search/sort flow, and PlayerPage tabs.
- Set coverage thresholds; add GitHub Actions to lint/test on PRs.
- Acceptance: CI green; coverage thresholds met.

9. Documentation and Ops
- Update README with run/test/refresh steps; add docs/operational-notes on persistence/manifest behavior.
- Add a data manifest (hashes/schema version) and a simple “DB status” panel in-app.
- Acceptance: Docs current; app shows DB status and prompts on manifest change.

Resource Requirements for Next Steps
Team
- 1–2 frontend engineers (React/TypeScript or strong JSDoc + TS-check) for components, hooks, and testing.
- 1 engineer with DuckDB-WASM familiarity for ingestion, schema tuning, and persistence.
- Optional: 0.5 QA for test planning and UX validation.

Time and Effort
- Phase 1 (Week 1): ~4–6 dev-days
  - PlayerPage fix (0.5–1d), test alignment (0.5–1d), useQuery hardening (1–1.5d), CSV normalization + validation improvements (1–2d).
- Phase 2 (Week 2): ~5–7 dev-days
  - Ingestion refactor + progress + parallelization (2–3d), formatter extraction (0.5d), route splitting + optional virtualization (1–2d).
- Phase 3 (Week 2): ~3–4 dev-days
  - Tests (hooks/pages) and CI setup (2d), docs + data manifest + DB status UI (1–2d).

Tooling/Infra
- GitHub Actions for CI (Node 18, lint/test/coverage).
- Husky for pre-commit lint/format.
- Optional react-window for virtualization, MSW for tests, and simple manifest JSON + hashing script.

Key Acceptance Criteria (Go/No-Go)
- No runtime errors; sorting consistent via allow-list.
- Ingestion completes with clear progress and error surfacing; filenames consistent.
- Tests in place with coverage thresholds; CI configured.
- Docs updated; DB status visible; manifest-based refresh prompt works.
- Optional virtualization and route code-splitting integrated without functional regressions.

This report prioritizes closing correctness/security gaps and establishing a maintainable baseline, enabling subsequent feature growth (leaders, advanced filters, saved views) with confidence in performance and stability.