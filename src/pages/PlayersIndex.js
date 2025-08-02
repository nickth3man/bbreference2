import React, { useState } from 'react';
import { useDuckDB } from '../hooks/useDuckDB';
import { Link } from 'react-router-dom';
import StatsTable from '../components/StatsTable';

const PlayersIndex = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: players, loading, error } = useDuckDB(
    `SELECT player_id, player_name, is_active, is_hall_of_famer FROM Players WHERE player_name LIKE ? COLLATE NOCASE ORDER BY player_name ASC`,
    [`%${searchTerm}%`]
  );

  const columns = [
    {
      key: 'player_name',
      label: 'Player',
      sortable: true,
      render: (player) => (
        <Link to={`/players/${player.player_id}`}>
          <span style={{ fontWeight: player.is_active ? 'bold' : 'normal' }}>
            {player.player_name}{player.is_hall_of_famer ? ' *' : ''}
          </span>
        </Link>
      ),
    },
  ];

  if (loading) return <div>Loading players...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>Players Index</h1>
      <input
        type="text"
        placeholder="Search players..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <StatsTable data={players} columns={columns} />
    </div>
  );
};

export default PlayersIndex;