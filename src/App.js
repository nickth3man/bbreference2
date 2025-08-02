import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { initializeDuckDB } from './services/duckdbService';

// Import newly created page components
import PlayersIndex from './pages/PlayersIndex';
import PlayerPage from './pages/PlayerPage';
import TeamsIndex from './pages/TeamsIndex';
import TeamFranchisePage from './pages/TeamFranchisePage';
import TeamSeasonPage from './pages/TeamSeasonPage';
import SeasonPage from './pages/SeasonPage';
import DraftsIndex from './pages/DraftsIndex';
import DraftPage from './pages/DraftPage';
import PlayoffPage from './pages/PlayoffPage';
import LeadersPage from './pages/LeadersPage';


function App() {
    const [dbInitialized, setDbInitialized] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function setupAndLoadData() {
            try {
                await initializeDuckDB();
                console.log("DuckDB initialization complete.");
                setDbInitialized(true);
            } catch (err) {
                console.error("Error setting up DuckDB or fetching data:", err);
                setError("Failed to load data.");
            }
        }

        setupAndLoadData();
    }, []);

    if (!dbInitialized) {
        return <div>Loading data, please wait...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <Router>
            <div className="App">
                <header className="App-header">
                    <nav>
                        <ul style={{ display: 'flex', listStyle: 'none', padding: 0 }}>
                            <li style={{ margin: '0 10px' }}><Link to="/">Home</Link></li>
                            <li style={{ margin: '0 10px' }}><Link to="/players">Players</Link></li>
                            <li style={{ margin: '0 10px' }}><Link to="/teams">Teams</Link></li>
                            <li style={{ margin: '0 10px' }}><Link to="/seasons/2023">Seasons (2023)</Link></li> {/* Example for a specific season */}
                            <li style={{ margin: '0 10px' }}><Link to="/drafts">Drafts</Link></li>
                            <li style={{ margin: '0 10px' }}><Link to="/playoffs/2023">Playoffs (2023)</Link></li> {/* Example for a specific playoff year */}
                            <li style={{ margin: '0 10px' }}><Link to="/leaders">Leaders</Link></li>
                        </ul>
                    </nav>
                    <h1>Local Basketball Reference Stats App</h1>
                </header>
                <main>
                    <Routes>
                        <Route path="/" element={<h2>Welcome to the Local Basketball Reference Stats App!</h2>} />
                        <Route path="/players" element={<PlayersIndex />} />
                        <Route path="/players/:id" element={<PlayerPage />} />
                        <Route path="/teams" element={<TeamsIndex />} />
                        <Route path="/teams/:teamId" element={<TeamFranchisePage />} />
                        <Route path="/teams/:teamId/:year" element={<TeamSeasonPage />} />
                        <Route path="/seasons/:year" element={<SeasonPage />} />
                        <Route path="/drafts" element={<DraftsIndex />} />
                        <Route path="/drafts/:year" element={<DraftPage />} />
                        <Route path="/playoffs/:year" element={<PlayoffPage />} />
                        <Route path="/leaders" element={<LeadersPage />} />
                        {/* Add more routes here as needed */}
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;