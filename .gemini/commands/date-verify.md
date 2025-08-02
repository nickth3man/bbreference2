# Date Verification Command

## Command: `/date:verify`

### Purpose
Verify and update the current date context in project documentation using web search to ensure accuracy.

### Usage
```
/date:verify
```

### What it does
1. Uses web search to get the current date
2. Checks NBA season schedule for current/upcoming seasons
3. Updates project documentation with accurate temporal context

### Implementation Instructions
When this command is used, perform the following steps:

1. **Web Search for Current Date**
   - Search: "what is today's date current date"
   - Verify month, day, and year
   
2. **NBA Season Context**
   - Search: "NBA season schedule 2024-25 2025-26 current season"
   - Determine current season status (active, ended, upcoming)
   - Get start date for next season
   
3. **Update Documentation Files**
   Update the following files with verified date information:
   - `GEMINI.md` - Project overview section
   - `BASKETBALL_DEV.md` - Current context section
   - `docs/design.md` - Header context
   - `docs/table-component-spec.md` - Header context
   
4. **Format Template**
   ```markdown
   ## Current Context ([Verified Date])
   - Today's date: [Current Date]
   - Current NBA season: [Season Status]
   - Next season: [Next Season] starts [Start Date]
   - **Basketball-Reference.com is the authoritative source of truth for all NBA data**
   ```

### Example Output
After running `/date:verify`, documentation should show:
```markdown
## Current Context (December 15, 2024)
- Today's date: December 15, 2024
- Current NBA season: 2024-25 season (active - started October 2024)
- Next season: 2025-26 NBA season starts October 2025
- **Basketball-Reference.com is the authoritative source of truth for all NBA data**
```

### Files to Update
- `GEMINI.md` (lines 4-9)
- `BASKETBALL_DEV.md` (lines 3-7)
- `docs/design.md` (lines 3-7)
- `docs/table-component-spec.md` (lines 3-7)

### Validation
- Ensure date format consistency across all files
- Verify NBA season information is accurate
- Confirm Basketball-Reference.com authority statement is preserved
