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
        // Query to get player_id, player_name, is_active, and is_hall_of_famer from the Players table
        // The Players table is now created from "Player Directory.csv" in duckdbService.js
        const query = `
          SELECT
            player_id,
            player_name,
            is_active,
            is_hall_of_famer
          FROM Players
          WHERE player_name LIKE '%${searchTerm}%' COLLATE NOCASE
          ORDER BY player_name ASC
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
            <Link to={`/players/${player.player_id}`}>
              <span style={{ fontWeight: player.is_active ? 'bold' : 'normal' }}>
                {player.player_name}{player.is_hall_of_famer ? ' *' : ''}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PlayersIndex;