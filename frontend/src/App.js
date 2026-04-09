import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import our screens
import Home from './Home';
import OnlineRoom from './OnlineRoom';
import OfflineGame from './OfflineGame';
// import OfflineGame from './OfflineGame'; // We will build/connect this next!

function App() {
  return (
    <Router>
      <div className="App bg-black min-h-screen text-white font-sans">
        <Routes>
          {/* The Main Menu */}
          <Route path="/" element={<Home />} />

          {/* ENGINE 1: The Online Multiplayer Lobby */}
          <Route path="/online/:roomCode" element={<OnlineRoom />} />
          <Route path="/offline" element={<OfflineGame />} />

          {/* ENGINE 2: The Offline Pass & Play Board */}
          <Route path="/offline" element={
            <div className="flex items-center justify-center min-h-screen">
              <h1 className="text-2xl text-zentry-copper">Offline Board Coming Soon...</h1>
            </div>
          } />
          
        </Routes>
      </div>
    </Router>
  );
}

export default App;