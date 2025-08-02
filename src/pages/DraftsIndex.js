import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { executeQuery } from '../services/duckdbService';

const DraftsIndex = () => {
  const [draftYears, setDraftYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

  useEffect(() => {
    const fetchDraftYears = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch distinct draft years from the DraftHistory table
        const query = `
          SELECT DISTINCT
            CAST(season AS INTEGER) AS draft_year
          FROM DraftHistory
          ORDER BY draft_year DESC;
        `;
        const result = await executeQuery(query);
        setDraftYears(result);
      } catch (err) {
        console.error("Error fetching draft years:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDraftYears();
  }, []);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedData = (data, sortConf) => {
    if (!data || data.length === 0) return [];
    if (!sortConf.key) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortConf.key];
      const bValue = b[sortConf.key];

      if (aValue === null || aValue === undefined) return sortConf.direction === 'ascending' ? 1 : -1;
      if (bValue === null || bValue === undefined) return sortConf.direction === 'ascending' ? -1 : 1;

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConf.direction === 'ascending'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      } else {
        return sortConf.direction === 'ascending'
          ? aValue - bValue
          : bValue - aValue;
      }
    });
  };

  if (loading) return <div>Loading draft years...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>NBA Draft History</h1>
      {draftYears.length > 0 ? (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
            <thead>
              <tr>
                <th
                  style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left', cursor: 'pointer' }}
                  onClick={() => requestSort('draft_year')}
                >
                  Draft Year {sortConfig.key === 'draft_year' ? (sortConfig.direction === 'ascending' ? ' ▲' : ' ▼') : ''}
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedData(draftYears, sortConfig).map((draft, index) => (
                <tr key={index}>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                    <Link to={`/drafts/${draft.draft_year}`}>{draft.draft_year}</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No draft history available.</p>
      )}
    </div>
  );
};

export default DraftsIndex;