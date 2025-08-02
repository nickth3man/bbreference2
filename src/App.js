import React, { useEffect, useState } from 'react';
import { initializeDuckDB, executeQuery } from './services/duckdbService';

function App() {
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function setupAndLoadData() {
            try {
                await initializeDuckDB();
                console.log("DuckDB initialization complete in App.js");

                // Example query after initialization
                const allPlayers = await executeQuery('SELECT * FROM Players LIMIT 10;');
                setPlayers(allPlayers);
            } catch (err) {
                console.error("Error setting up DuckDB or fetching data:", err);
                setError("Failed to load data.");
            } finally {
                setLoading(false);
            }
        }

        setupAndLoadData();
    }, []);

    if (loading) {
        return <div>Loading data...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="App">
            <header className="App-header">
                <h1>Local Basketball Reference Stats App</h1>
            </header>
            <main>
                <h2>First 10 Players</h2>
                {players.length > 0 ? (
                    <ul>
                        {players.map((player, index) => (
                            <li key={index}>{player.full_name} (ID: {player.id})</li>
                        ))}
                    </ul>
                ) : (
                    <p>No players found or data not loaded.</p>
                )}
                <p>Check console for DuckDB initialization messages.</p>
            </main>
        </div>
    );
}

export default App;