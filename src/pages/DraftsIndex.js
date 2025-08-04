import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '../hooks/useQuery';

const DraftsIndex = () => {
  const { data: draftYears, loading, error } = useQuery(`
          SELECT DISTINCT
            CAST(season AS INTEGER) AS draft_year
          FROM DraftHistory
          ORDER BY draft_year DESC;
        `);

  

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
                <th>
                  Draft Year
                </th>
              </tr>
            </thead>
            <tbody>
              {draftYears.map((draft, index) => (
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