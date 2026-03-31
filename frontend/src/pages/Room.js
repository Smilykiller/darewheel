import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Crown, Play, Copy, CheckCircle2, Loader2, MessageCircle } from 'lucide-react';
import api from '../api';
import Bottle from '../components/Bottle'; // Import the physics bottle!

let socket;

const Room = () => {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  
  const [roomData, setRoomData] = useState(null);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [gameMode, setGameMode] = useState('normal');
  
  // Game States
  const [gameState, setGameState] = useState('waiting'); // 'waiting' or 'playing'
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [activePlayer, setActivePlayer] = useState(null);

  const currentUser = localStorage.getItem('username');

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const res = await api.post('/rooms/join', { roomCode });
        setRoomData(res.data);
        
        // Create an array of player objects
        const loadedPlayers = res.data.players.map(id => ({ username: 'Player ' + id.slice(-4), id }));
        // Put the current user in the list properly
        loadedPlayers[0].username = currentUser; 
        
        setPlayers(loadedPlayers);
        setGameMode(res.data.mode);
        setIsHost(true); // Simplified for demo

        setLoading(false);

        socket = io('http://localhost:5000');
        socket.emit('join_room', roomCode, currentUser);

        socket.on('player_joined', (data) => {
          setPlayers((prev) => [...prev, { username: data.username, id: data.socketId }]);
        });

        // Listen for the host starting the game
        socket.on('game_started', ({ mode }) => {
          setGameMode(mode);
          setGameState('playing');
        });

      } catch (error) {
        alert("Failed to load room.");
        navigate('/');
      }
    };

    fetchRoom();
    return () => { if (socket) socket.disconnect(); };
  }, [roomCode, navigate, currentUser]);

  const startGame = () => {
    setGameState('playing');
    socket.emit('start_game', { roomCode, mode: gameMode });
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Called when the bottle stops spinning
  const handleTurnAssigned = async (player) => {
    setActivePlayer(player);
    
    try {
      // Pull a random question from MongoDB!
      const res = await api.get(`/questions/random?mode=${gameMode}`);
      setCurrentQuestion(res.data);
    } catch (error) {
      console.error("Error fetching question", error);
    }
  };

  if (loading) return <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'var(--deep)' }}><Loader2 className="animate-spin" size={50} color="var(--pink)" /></div>;

  return (
    <div style={{ minHeight: '100vh', padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', overflowX: 'hidden' }}>
      
      {/* HEADER (Always Visible) */}
      <div style={{ position: 'absolute', top: '20px', left: '30px', fontFamily: "'Bebas Neue', sans-serif", fontSize: '2rem', letterSpacing: '2px' }}>
        DARE<span style={{ color: 'var(--pink)' }}>WHEEL</span>
      </div>

      <AnimatePresence mode="wait">
        {gameState === 'waiting' ? (
          // ================= WAITING LOBBY =================
          <motion.div key="waiting" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, y: -50 }} style={{ width: '100%', maxWidth: '1000px', marginTop: '60px' }}>
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <h2 style={{ fontFamily: "'Syne Mono', monospace", color: 'var(--cyan)' }}>// WAITING LOBBY</h2>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
                <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '5rem', letterSpacing: '4px' }}>{roomCode}</h1>
                <button onClick={copyRoomCode} style={{ background: 'var(--card)', border: '1px solid var(--card-b)', padding: '15px', borderRadius: '12px', cursor: 'pointer', color: copied ? 'var(--lime)' : 'white' }}>
                  {copied ? <CheckCircle2 size={24} /> : <Copy size={24} />}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <div style={{ flex: '1 1 400px', background: 'var(--card)', border: '1px solid var(--card-b)', borderRadius: '20px', padding: '30px', backdropFilter: 'blur(10px)' }}>
                <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}><Users color="var(--cyan)"/> PLAYERS ({players.length}/8)</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {players.map((p, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', background: i === 0 ? 'rgba(255,45,120,0.1)' : 'rgba(255,255,255,0.02)', padding: '15px', borderRadius: '10px', border: i === 0 ? '1px solid rgba(255,45,120,0.3)' : '1px solid rgba(255,255,255,0.05)' }}>
                      <span>{p.username} {i===0 && '(Host)'}</span>
                      {i === 0 && <Crown color="var(--pink)" size={20} />}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ flex: '1 1 400px', background: 'var(--card)', border: '1px solid var(--card-b)', borderRadius: '20px', padding: '30px', backdropFilter: 'blur(10px)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2rem', marginBottom: '20px' }}>GAME SETTINGS</h3>
                  <label style={{ color: 'var(--muted)', fontSize: '0.9rem', textTransform: 'uppercase' }}>Select Mode</label>
                  <select value={gameMode} onChange={(e) => setGameMode(e.target.value)} style={{ width: '100%', padding: '15px', background: 'rgba(0,0,0,0.5)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', fontSize: '1.1rem', outline: 'none', cursor: 'pointer', marginTop: '10px' }}>
                    <option value="normal">Normal (Fun & Casual)</option>
                    <option value="flirty">Flirty (Playful Teasing)</option>
                    <option value="couples">Couples (Deep Intimacy)</option>
                    <option value="hardcore">Hardcore (No Boundaries)</option>
                    <option value="family_friendly">Family Friendly</option>
                  </select>
                </div>
                <button onClick={startGame} className="nav-cta" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginTop: '40px', padding: '20px' }}>
                  <Play fill="white" size={20} /> START GAME
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          // ================= GAME BOARD =================
          <motion.div key="game" initial={{ opacity: 0, scale: 1.1 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} style={{ width: '100%', maxWidth: '800px', marginTop: '60px', textAlign: 'center' }}>
            <h2 style={{ fontFamily: "'Syne Mono', monospace", color: 'var(--cyan)', letterSpacing: '2px', marginBottom: '10px' }}>// SWIPE TO SPIN</h2>
            
            {/* The 3D Physics Bottle Component */}
            <Bottle socket={socket} roomCode={roomCode} isHost={isHost} players={players} onTurnAssigned={handleTurnAssigned} />

            {/* The Question Card (Appears when bottle stops) */}
            <AnimatePresence>
              {currentQuestion && activePlayer && (
                <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} style={{ background: 'var(--card)', border: `2px solid ${currentQuestion.question_type === 'truth' ? 'var(--cyan)' : 'var(--pink)'}`, padding: '30px', borderRadius: '20px', marginTop: '40px', backdropFilter: 'blur(15px)', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '20px', color: 'var(--muted)' }}>
                    <MessageCircle size={20} />
                    <span style={{ textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.9rem' }}>
                      {activePlayer.username}'S TURN ({currentQuestion.question_type.replace('_', ' ')})
                    </span>
                  </div>
                  
                  <h3 style={{ fontSize: '1.6rem', lineHeight: '1.5', fontWeight: '500' }}>
                    "{currentQuestion.question_text}"
                  </h3>
                  
                  <div style={{ marginTop: '25px' }}>
                    <span style={{ background: 'rgba(255,255,255,0.1)', padding: '5px 15px', borderRadius: '20px', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                      Category: {currentQuestion.category} | Difficulty: {currentQuestion.difficulty_level}/4
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Room;