import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import socket from '../socket';
import ChatBox from '../components/ChatBox';

const OnlineGame = () => {
  const { roomCode } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  // We grab the state passed from the Lobby
  const myUsername = location.state?.username || "Guest"; 
  const players = location.state?.players || [];
  const category = location.state?.category || "Normal";

  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  // If someone tries to navigate directly here without going through the lobby, kick them out.
  useEffect(() => {
    if (players.length === 0) {
      navigate('/');
    }
  }, [players, navigate]);

  // Listen for spin events from the server
  useEffect(() => {
    socket.on('bottle_is_spinning', ({ velocity, angle }) => {
      setIsSpinning(true);
      setSelectedPlayer(null);
      // We will refine the exact physics sync later! For now, just spin.
      setRotation((prev) => prev + 1800 + angle); 
    });

    socket.on('turn_assigned', ({ selectedPlayerId }) => {
      // Find the player object based on the ID the server sent
      const landedOn = players.find(p => p.id === selectedPlayerId);
      setSelectedPlayer(landedOn);
      setIsSpinning(false);
    });

    return () => {
      socket.off('bottle_is_spinning');
      socket.off('turn_assigned');
    };
  }, [players]);

  // When the host clicks the bottle on their screen
  const handleHostSpin = () => {
    if (isSpinning) return;
    
    // 1. Tell everyone else to start animating
    const randomAngle = Math.random() * 360;
    socket.emit('spin_bottle', { roomCode, velocity: 5, angle: randomAngle });

    // 2. Animate locally
    setIsSpinning(true);
    setSelectedPlayer(null);
    setRotation(rotation + 1800 + randomAngle);

    // 3. Calculate who it lands on and tell the server (after the 3s animation)
    setTimeout(() => {
      const finalAngle = (rotation + 1800 + randomAngle) % 360;
      const sectorSize = 360 / players.length;
      const index = Math.floor(finalAngle / sectorSize);
      const landedIndex = (players.length - index) % players.length;
      
      const chosenPlayer = players[landedIndex];
      
      // Tell the server who officially has to answer the Truth or Dare
      socket.emit('bottle_stopped', { roomCode, selectedPlayerId: chosenPlayer.id });
      
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 flex flex-col items-center">
      <div className="w-full max-w-4xl flex justify-between items-center mb-10">
        <div className="font-black tracking-tighter text-xl">
          DARE<span className="text-zentry-copper">WHEEL</span> 
        </div>
        <div className="font-mono text-gray-500 uppercase text-xs">
          Room: {roomCode} • Category: {category}
        </div>
      </div>

      <div className="relative flex flex-col items-center justify-center w-full max-w-4xl mt-10">
        
        {/* THE CIRCLE OF NAMES */}
        <div className="relative w-[320px] h-[320px] md:w-[500px] md:h-[500px] flex items-center justify-center rounded-full border border-white/5">
          {players.map((p, i) => {
            const angle = (i * 360) / players.length;
            return (
              <div 
                key={p.id}
                className="absolute font-black uppercase italic tracking-tight transition-all duration-500"
                style={{
                  transform: `rotate(${angle}deg) translateY(-140px) md:translateY(-220px)`,
                  color: selectedPlayer?.id === p.id ? '#C48446' : 'white',
                  fontSize: selectedPlayer?.id === p.id ? '1.5rem' : '1rem',
                  opacity: isSpinning ? 0.3 : 1
                }}
              >
                {p.username} {p.username === myUsername && <span className="text-xs text-gray-500">(You)</span>}
              </div>
            );
          })}

          {/* THE BOTTLE */}
          <motion.div 
            animate={{ rotate: rotation }}
            transition={{ duration: 3, ease: [0.45, 0.05, 0.55, 0.95] }}
            className={`relative z-10 w-16 h-48 md:w-20 md:h-64 ${!isSpinning ? 'cursor-pointer hover:scale-105 transition-transform' : ''}`}
            onClick={handleHostSpin} 
          >
            <div className="w-full h-full bg-gradient-to-b from-zentry-copper via-zentry-copper/80 to-zentry-copper rounded-full shadow-[0_0_30px_rgba(196,132,70,0.3)] flex items-start justify-center pt-4">
              <div className="w-4 h-4 bg-black/20 rounded-full"></div> 
            </div>
          </motion.div>
        </div>

        {/* ACTION FOOTER */}
        <div className="mt-20 text-center h-32">
          {selectedPlayer && !isSpinning ? (
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
              <h3 className="text-gray-500 font-mono text-sm uppercase mb-2">The bottle chose</h3>
              <h2 className="text-5xl font-black text-zentry-copper italic uppercase mb-8">{selectedPlayer.username}</h2>
              {/* Question logic will go here! */}
            </motion.div>
          ) : (
            <div className="font-mono text-gray-500 uppercase tracking-widest animate-pulse mt-8">
              {isSpinning ? "The wheel of fate is turning..." : "Tap the bottle to spin"}
            </div>
          )}
        </div>
      </div>
      
      <ChatBox roomCode={roomCode} username={myUsername} />
    </div>
  );
};

export default OnlineGame;