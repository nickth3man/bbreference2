import React, { useState, useEffect } from 'react';
import { executeQuery } from '../services/duckdbService';
import { Link } from 'react-router-dom';

const DraftsIndex = () => {
  const [draftYears, setDraftYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDraftYears = async () => {
      try {
        setLoading(true);
        // Assuming 'draft_history.csv' contains a "Draft Year" column
        const query = `
          SELECT DISTINCT "Draft Year" AS draft_year
          FROM "draft_history.csv"
          ORDER BY "Draft Year" DESC;
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

  if (loading) return <div>Loading draft years...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>NBA Drafts Index</h1>
      <ul>
        {draftYears.map((draft) => (
          <li key={draft.draft_year}>
            <Link to={`/drafts/${draft.draft_year}`}>{draft.draft_year} NBA Draft</Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DraftsIndex;