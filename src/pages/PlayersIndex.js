import React, { useState } from 'react';
import { useQuery } from '../hooks/useQuery';
import { Link } from 'react-router-dom';
import StatsTable from '../components/StatsTable';

const PlayersIndex = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { 
    data: players, 
    loading, 
    error, 
    sortConfig, 
    requestSort 
  } = useQuery(
    `SELECT player_id, player_name, is_active, is_hall_of_famer FROM Players WHERE player_name LIKE ? COLLATE NOCASE`,
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
    {
      key: 'is_active',
      label: 'Active',
      sortable: true,
    },
    {
      key: 'is_hall_of_famer',
      label: 'HoF',
      sortable: true,
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
      <StatsTable 
        data={players} 
        columns={columns} 
        sortConfig={sortConfig} 
        requestSort={requestSort} 
      />
    </div>
  );
};

export default PlayersIndex;
