/**
 * Data linking utilities for Basketball Reference app
 * 
 * Provides helper functions to construct URLs and identify related entities
 * across different data tables, handling team franchise linking and player IDs.
 */

/**
 * Generate internal application links for players
 * @param {string} playerId - Basketball-Reference player ID (e.g., 'jamesle01')
 * @param {string} section - Optional section ('stats', 'bio', 'playoffs', etc.)
 * @returns {string} Internal app URL
 */
export function getPlayerUrl(playerId, section = 'stats') {
  if (!playerId) {
    return '/players';
  }
  
  const baseUrl = `/players/${playerId}`;
  
  if (section === 'stats') {
    return baseUrl;
  }
  
  return `${baseUrl}/${section}`;
}

/**
 * Generate internal application links for teams
 * @param {string} teamId - Team ID or abbreviation
 * @param {number} season - Optional season year
 * @param {string} section - Optional section ('roster', 'stats', 'schedule', etc.)
 * @returns {string} Internal app URL
 */
export function getTeamUrl(teamId, season = null, section = 'stats') {
  if (!teamId) {
    return '/teams';
  }
  
  let baseUrl = `/teams/${teamId}`;
  
  if (season) {
    baseUrl += `/${season}`;
  }
  
  if (section !== 'stats') {
    baseUrl += `/${section}`;
  }
  
  return baseUrl;
}

/**
 * Generate URL for franchise history page
 * @param {string} franchiseId - Franchise ID
 * @returns {string} Internal app URL
 */
export function getFranchiseUrl(franchiseId) {
  if (!franchiseId) {
    return '/teams';
  }
  
  return `/franchise/${franchiseId}`;
}

/**
 * Generate URL for season overview page
 * @param {number} season - Season year
 * @param {string} section - Optional section ('standings', 'leaders', 'playoffs', etc.)
 * @returns {string} Internal app URL
 */
export function getSeasonUrl(season, section = 'standings') {
  if (!season) {
    return '/seasons';
  }
  
  const baseUrl = `/seasons/${season}`;
  
  if (section === 'standings') {
    return baseUrl;
  }
  
  return `${baseUrl}/${section}`;
}

/**
 * Generate URL for draft pages
 * @param {number} year - Draft year
 * @param {string} section - Optional section ('overview', 'combine', etc.)
 * @returns {string} Internal app URL
 */
export function getDraftUrl(year, section = 'overview') {
  if (!year) {
    return '/draft';
  }
  
  const baseUrl = `/draft/${year}`;
  
  if (section === 'overview') {
    return baseUrl;
  }
  
  return `${baseUrl}/${section}`;
}

/**
 * Generate URL for playoff pages
 * @param {number} year - Playoff year
 * @param {string} section - Optional section ('bracket', 'series', 'stats', etc.)
 * @returns {string} Internal app URL
 */
export function getPlayoffUrl(year, section = 'bracket') {
  if (!year) {
    return '/playoffs';
  }
  
  const baseUrl = `/playoffs/${year}`;
  
  if (section === 'bracket') {
    return baseUrl;
  }
  
  return `${baseUrl}/${section}`;
}

/**
 * Extract player ID from various formats
 * @param {string} input - Player name, ID, or URL
 * @returns {string|null} Normalized player ID
 */
export function extractPlayerId(input) {
  if (!input) {
    return null;
  }
  
  // If it looks like a player ID already (lowercase with numbers)
  if (/^[a-z]+[a-z0-9]*\d{2}$/.test(input)) {
    return input;
  }
  
  // Extract from URL pattern
  const urlMatch = input.match(/\/players\/([a-z]+[a-z0-9]*\d{2})/);
  if (urlMatch) {
    return urlMatch[1];
  }
  
  return null;
}

/**
 * Extract team ID from various formats
 * @param {string} input - Team name, abbreviation, or URL
 * @returns {string|null} Normalized team ID
 */
export function extractTeamId(input) {
  if (!input) {
    return null;
  }
  
  // If it looks like a team abbreviation (3 letters)
  if (/^[A-Z]{3}$/.test(input)) {
    return input;
  }
  
  // Extract from URL pattern
  const urlMatch = input.match(/\/teams\/([A-Z]{3})/);
  if (urlMatch) {
    return urlMatch[1];
  }
  
  return null;
}

/**
 * Format season display (e.g., 2024 -> "2023-24")
 * @param {number} season - Season ending year
 * @returns {string} Formatted season string
 */
export function formatSeason(season) {
  if (!season || season < 1947) {
    return 'Unknown';
  }
  
  const startYear = season - 1;
  const endYear = season.toString().slice(-2);
  
  return `${startYear}-${endYear}`;
}

/**
 * Parse season from various formats
 * @param {string|number} input - Season string or number
 * @returns {number|null} Season ending year
 */
export function parseSeason(input) {
  if (!input) {
    return null;
  }
  
  // If it's already a number
  if (typeof input === 'number') {
    return input;
  }
  
  // Parse "2023-24" format
  const seasonMatch = input.match(/^(\d{4})-(\d{2})$/);
  if (seasonMatch) {
    return parseInt(seasonMatch[1], 10) + 1;
  }
  
  // Parse single year
  const yearMatch = input.match(/^(\d{4})$/);
  if (yearMatch) {
    return parseInt(yearMatch[1], 10);
  }
  
  return null;
}

/**
 * Get current NBA season based on date
 * @param {Date} date - Optional date (defaults to current date)
 * @returns {number} Current season ending year
 */
export function getCurrentSeason(date = new Date()) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // JavaScript months are 0-indexed
  
  // NBA season typically starts in October
  // So if we're in months 1-9, we're still in the previous season
  if (month <= 9) {
    return year;
  } else {
    return year + 1;
  }
}

/**
 * Check if a season is valid for NBA data
 * @param {number} season - Season ending year
 * @returns {boolean} Whether the season is valid
 */
export function isValidSeason(season) {
  if (!season || typeof season !== 'number') {
    return false;
  }
  
  const firstSeason = 1947; // BAA/NBA started in 1946-47
  const currentSeason = getCurrentSeason();
  
  return season >= firstSeason && season <= currentSeason;
}
