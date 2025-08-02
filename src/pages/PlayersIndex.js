import React, { useState, useEffect } from 'react';
import { executeQuery } from '../services/duckdbService';
import { Link } from 'react-router-dom';

const PlayersIndex = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        setLoading(true);
        // Query to get player_id and player_name from Player Directory.csv
        // This assumes Player Directory.csv is ingested into a table named 'Player_Directory'
        // If not, adjust the table name accordingly.
        const query = `
          SELECT
            "player_id",
            "Player" AS player_name
          FROM "Player Directory.csv"
          WHERE "Player" LIKE '%${searchTerm}%' COLLATE NOCASE
          ORDER BY "Player" ASC
        `;
        const result = await executeQuery(query);
        setPlayers(result);
      } catch (err) {
        console.error("Error fetching players:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();
  }, [searchTerm]);

  if (loading) return <div>Loading players...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Players Index</h1>
      <input
        type="text"
        placeholder="Search players..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <ul>
        {players.map((player) => (
          <li key={player.player_id}>
            <Link to={`/players/${player.player_id}`}>{player.player_name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PlayersIndex;