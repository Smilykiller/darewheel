import React from 'react';
import { BrowserRouter as Router, Routes, Route, Form } from 'react-router-dom';

// Import our screens
import Home from './pages/Home';
import OnlineRoom from './pages/OnlineRoom';
import OfflineGame from './pages/OfflineGame';
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