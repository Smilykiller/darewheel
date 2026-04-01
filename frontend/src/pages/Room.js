import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Flame, Heart, Skull, Smile, Users, X } from 'lucide-react';
import api from '../api';

const Room = () => {
  const { roomCode } = useParams();
  
  // Game State
  const [players, setPlayers] = useState([]);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [gameMode, setGameMode] = useState('Normal');
  
  // Spin State
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  
  // Question State
  const [modalState, setModalState] = useState('none'); // 'none' | 'choice' | 'question'
  const [currentQuestion, setCurrentQuestion] = useState(null);

  // Initialize Host
  useEffect(() => {
    const hostName = localStorage.getItem('username') || 'Host';
    setPlayers([hostName]);
  }, []);

  // --- 1. PLAYER MANAGER (OFFLINE FIX) ---
  const handleAddPlayer = (e) => {
    e.preventDefault();
    if (!newPlayerName.trim()) return;
    if (players.includes(newPlayerName)) return alert("Player already exists!");
    
    setPlayers([...players, newPlayerName.trim()]);
    setNewPlayerName('');
  };

  const removePlayer = (nameToRemove) => {
    setPlayers(players.filter(name => name !== nameToRemove));
  };

  // --- 2. SPINNING LOGIC & MATH ---
  const spinBottle = () => {
    if (spinning || players.length < 2) return alert("You need at least 2 players to spin!");
    
    setSpinning(true);
    setModalState('none');

    // 1. Pick a random winner
    const winnerIndex = Math.floor(Math.random() * players.length);
    
    // 2. Calculate the exact angle needed to point to them
    const sliceAngle = 360 / players.length;
    const targetAngle = winnerIndex * sliceAngle;
    
    // 3. Add 5-8 random extra full spins for suspense
    const extraSpins = (Math.floor(Math.random() * 4) + 5) * 360; 
    
    // 4. Calculate total rotation (bottle points UP at 0 deg, so we rotate clockwise)
    const finalRotation = rotation + extraSpins + targetAngle - (rotation % 360);

    setRotation(finalRotation);

    // 5. Wait for the animation to finish (4 seconds), then show the popup
    setTimeout(() => {
      setSelectedPlayer(players[winnerIndex]);
      setModalState('choice');
      setSpinning(false);
    }, 4000);
  };

  // --- 3. FETCH QUESTION ---
  const handleChoice = async (type) => {
    try {
      // In a real app, you'd pass the mode/type. For now, our SQLite gets a random one!
      const res = await api.get(`/questions/random`);
      setCurrentQuestion(res.data.question_text || res.data.question || "Do 10 pushups! (Fallback Dare)");
      setModalState('question');
    } catch (error) {
      setCurrentQuestion("Oops! Database couldn't find a question. Tell a secret!");
      setModalState('question');
    }
  };

  // --- UI CONSTANTS ---
  const MODES = [
    { name: 'Normal', icon: <Smile size={16}/>, color: '#4facfe' },
    { name: 'Flirty', icon: <Flame size={16}/>, color: '#ff6520' },
    { name: 'Couples', icon: <Heart size={16}/>, color: '#ff2d78' },
    { name: 'Hardcore', icon: <Skull size={16}/>, color: '#9d00ff' },
    { name: 'Family', icon: <Users size={16}/>, color: '#b8ff00' }
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#04040f', color: 'white', display: 'flex', flexDirection: 'column', overflow: 'hidden', fontFamily: "'Rajdhani', sans-serif" }}>
      
      {/* HEADER & CONTROLS */}
      <div style={{ padding: '20px', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
        
        {/* ROOM INFO */}
        <div>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '2px', color: 'var(--cyan)' }}>ROOM: {roomCode}</h2>
          <div style={{ fontSize: '0.8rem', color: '#888' }}>{players.length} Players connected</div>
        </div>

        {/* --- 4. NEW INNOVATIVE MODE SELECTOR --- */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '5px' }}>
          {MODES.map(mode => (
            <motion.button 
              key={mode.name}
              whileHover={{ y: -2 }}
              onClick={() => setGameMode(mode.name)}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '30px', 
                background: gameMode === mode.name ? mode.color + '33' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${gameMode === mode.name ? mode.color : 'rgba(255,255,255,0.1)'}`,
                color: gameMode === mode.name ? mode.color : '#888',
                cursor: 'pointer', transition: 'all 0.3s', whiteSpace: 'nowrap'
              }}
            >
              {mode.icon} <span style={{ fontWeight: 600 }}>{mode.name}</span>
            </motion.button>
          ))}
        </div>

        {/* --- 5. OFFLINE PLAYER MANAGER --- */}
        <form onSubmit={handleAddPlayer} style={{ display: 'flex', gap: '8px' }}>
          <input 
            type="text" 
            placeholder="Add Player Name..." 
            value={newPlayerName} 
            onChange={(e) => setNewPlayerName(e.target.value)}
            style={{ padding: '10px 15px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', width: '200px', outline: 'none' }}
          />
          <button type="submit" style={{ padding: '10px 15px', borderRadius: '8px', background: 'var(--pink)', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <UserPlus size={18} />
          </button>
        </form>
      </div>

      {/* --- 6. THE ARENA & BOTTLE --- */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
        
        <div style={{ position: 'relative', width: '400px', height: '400px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          
          {/* THE BOTTLE */}
          <motion.div 
            onClick={spinBottle}
            animate={{ rotate: rotation }}
            transition={{ type: "spring", bounce: 0.1, duration: 4 }}
            style={{
              width: '60px', height: '220px', borderRadius: '100px', 
              background: 'linear-gradient(180deg, var(--cyan) 0%, var(--pink) 100%)',
              boxShadow: '0 0 40px rgba(255,45,120,0.5)',
              position: 'absolute', zIndex: 5, cursor: spinning ? 'not-allowed' : 'pointer',
              display: 'flex', justifyContent: 'center', paddingTop: '15px'
            }}
          >
            {/* The tip of the bottle so players know who it points to */}
            <div style={{ width: '20px', height: '30px', background: 'rgba(255,255,255,0.8)', borderRadius: '10px', boxShadow: '0 0 10px white' }} />
          </motion.div>

          {/* PLAYERS (Perfectly orbited via Math!) */}
          {players.map((player, index) => {
            const angle = (index / players.length) * 360; // Spread evenly
            const radius = 180; // Distance from center
            const x = Math.sin((angle * Math.PI) / 180) * radius;
            const y = -Math.cos((angle * Math.PI) / 180) * radius; // Negative Y is UP in web space
            
            return (
              <motion.div 
                key={index}
                initial={{ scale: 0 }}
                animate={{ scale: 1, x, y }}
                style={{
                  position: 'absolute',
                  padding: '10px 20px', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)',
                  border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', color: 'white',
                  fontWeight: 'bold', letterSpacing: '1px', boxShadow: '0 5px 15px rgba(0,0,0,0.5)',
                  display: 'flex', alignItems: 'center', gap: '8px', zIndex: 2
                }}
              >
                {player}
                {players.length > 1 && (
                  <X size={14} color="#ff2d78" style={{ cursor: 'pointer' }} onClick={() => removePlayer(player)} />
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* --- 7. THE TRUTH OR DARE MODAL POPUPS --- */}
      <AnimatePresence>
        {modalState !== 'none' && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(4,4,15,0.8)', backdropFilter: 'blur(10px)', zIndex: 100, display: 'flex', justifyContent: 'center', alignItems: 'center' }}
          >
            <motion.div 
              initial={{ scale: 0.8, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, y: 50 }}
              style={{ background: 'var(--card)', border: '1px solid rgba(255,255,255,0.1)', padding: '50px', borderRadius: '20px', textAlign: 'center', maxWidth: '500px', width: '90%', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}
            >
              
              <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.5rem', color: 'var(--cyan)', letterSpacing: '2px', marginBottom: '10px' }}>
                IT'S YOUR TURN, {selectedPlayer.toUpperCase()}!
              </h3>
              
              {/* CHOICE SCREEN */}
              {modalState === 'choice' && (
                <>
                  <p style={{ color: '#aaa', fontSize: '1.2rem', marginBottom: '40px' }}>Make your choice carefully...</p>
                  <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
                    <button 
                      onClick={() => handleChoice('truth')}
                      style={{ flex: 1, padding: '20px', fontSize: '1.5rem', fontFamily: "'Bebas Neue', sans-serif", background: 'var(--cyan)', color: 'black', border: 'none', borderRadius: '15px', cursor: 'pointer', letterSpacing: '2px', boxShadow: '0 0 20px rgba(0,232,255,0.3)' }}
                    >TRUTH</button>
                    <button 
                      onClick={() => handleChoice('dare')}
                      style={{ flex: 1, padding: '20px', fontSize: '1.5rem', fontFamily: "'Bebas Neue', sans-serif", background: 'var(--pink)', color: 'white', border: 'none', borderRadius: '15px', cursor: 'pointer', letterSpacing: '2px', boxShadow: '0 0 20px rgba(255,45,120,0.3)' }}
                    >DARE</button>
                  </div>
                </>
              )}

              {/* QUESTION SCREEN */}
              {modalState === 'question' && (
                <>
                  <div style={{ padding: '30px', background: 'rgba(255,255,255,0.05)', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '30px', marginTop: '20px' }}>
                    <p style={{ fontSize: '1.4rem', lineHeight: '1.5', fontWeight: 500 }}>{currentQuestion}</p>
                  </div>
                  <button 
                    onClick={() => setModalState('none')}
                    className="nav-cta" style={{ width: '100%' }}
                  >DONE!</button>
                </>
              )}

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Room;