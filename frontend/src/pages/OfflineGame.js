import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Play, RotateCcw, UserPlus, Trash2, Skull } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const OfflineGame = () => {
  const navigate = useNavigate();
  
  // 1. GAME PHASES: 'setup', 'category', 'playing'
  const [phase, setPhase] = useState('setup');
  
  // 2. PLAYER STATE
  const [players, setPlayers] = useState([]);
  const [newPlayerName, setNewPlayerName] = useState('');
  
  // 3. SPIN STATE
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [gameCategory, setGameCategory] = useState('Normal');

  // --- PHASE: SETUP LOGIC ---
  const addPlayer = () => {
    if (newPlayerName.trim() && players.length < 12) {
      setPlayers([...players, { id: Date.now(), name: newPlayerName.trim() }]);
      setNewPlayerName('');
    }
  };

  const removePlayer = (id) => {
    setPlayers(players.filter(p => p.id !== id));
  };

  // --- PHASE: ARENA LOGIC ---
  const spinBottle = () => {
    if (isSpinning) return;
    
    setIsSpinning(true);
    setSelectedPlayer(null);

    // Generate a massive random rotation (at least 5 full turns + random angle)
    const extraSpins = 1800 + Math.random() * 1800; 
    const newRotation = rotation + extraSpins;
    setRotation(newRotation);

    // Calculate who it lands on after the animation (3 seconds)
    setTimeout(() => {
      const finalAngle = newRotation % 360;
      // Math: 0 degrees is usually "Up". 
      // We divide 360 by player count to find the arc size for each person.
      const sectorSize = 360 / players.length;
      const index = Math.floor(finalAngle / sectorSize);
      
      // We reverse the index because the bottle rotates clockwise, 
      // effectively moving the "pointer" counter-clockwise through the list.
      const landedIndex = (players.length - index) % players.length;
      
      setSelectedPlayer(players[landedIndex]);
      setIsSpinning(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 flex flex-col items-center">
      
      {/* HEADER */}
      <div className="w-full max-w-4xl flex justify-between items-center mb-10">
        <button onClick={() => navigate('/')} className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <ArrowLeft size={24} />
        </button>
        <div className="font-black tracking-tighter text-xl">
          DARE<span className="text-zentry-copper">WHEEL</span> <span className="text-xs font-mono text-gray-500 ml-2">// OFFLINE</span>
        </div>
        <div className="w-10"></div> {/* Spacer */}
      </div>

      <AnimatePresence mode="wait">
        
        {/* --- PHASE 1: SETUP --- */}
        {phase === 'setup' && (
          <motion.div 
            key="setup"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-md flex flex-col gap-6"
          >
            <div className="text-center">
              <h2 className="text-4xl font-black mb-2 uppercase tracking-tight">Gather the Squad</h2>
              <p className="text-gray-500 font-mono text-sm uppercase">Add 2 to 12 players</p>
            </div>

            <div className="flex gap-2">
              <input 
                type="text" 
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addPlayer()}
                placeholder="PLAYER NAME"
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-zentry-copper font-bold"
              />
              <button onClick={addPlayer} className="bg-zentry-copper text-black p-3 rounded-lg hover:bg-white transition-colors">
                <UserPlus size={24} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {players.map((p) => (
                <motion.div 
                  layout
                  initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  key={p.id} 
                  className="bg-white/5 border border-white/10 p-3 rounded-lg flex justify-between items-center group"
                >
                  <span className="font-bold truncate mr-2">{p.name}</span>
                  <button onClick={() => removePlayer(p.id)} className="text-gray-600 hover:text-red-500 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </motion.div>
              ))}
            </div>

            <button 
              disabled={players.length < 2}
              onClick={() => setPhase('category')}
              className="mt-4 w-full bg-white text-black font-black py-4 rounded-xl tracking-widest uppercase disabled:opacity-20 transition-opacity"
            >
              Continue to Category
            </button>
          </motion.div>
        )}

        {/* --- PHASE 2: CATEGORY --- */}
        {phase === 'category' && (
          <motion.div 
            key="category"
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }}
            className="w-full max-w-2xl text-center"
          >
            <h2 className="text-5xl font-black mb-10 uppercase italic tracking-tighter">Choose Your Poison</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {['Normal', 'Flirty', 'Hardcore', 'Extreme'].map((cat) => (
                <button 
                  key={cat}
                  onClick={() => { setGameCategory(cat); setPhase('playing'); }}
                  className="group relative p-8 bg-white/5 border border-white/10 rounded-2xl hover:border-zentry-copper transition-all overflow-hidden"
                >
                  <div className="relative z-10 text-2xl font-black italic uppercase tracking-widest group-hover:text-zentry-copper">{cat}</div>
                  <div className="absolute inset-0 bg-zentry-copper/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </button>
              ))}
            </div>
            <button onClick={() => setPhase('setup')} className="mt-10 text-gray-500 font-mono text-xs uppercase hover:text-white">← Edit Players</button>
          </motion.div>
        )}

        {/* --- PHASE 3: THE ARENA --- */}
        {phase === 'playing' && (
          <motion.div 
            key="playing"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="relative flex flex-col items-center justify-center w-full max-w-4xl"
          >
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
                    {p.name}
                  </div>
                );
              })}

              {/* THE BOTTLE */}
              <motion.div 
                animate={{ rotate: rotation }}
                transition={{ duration: 3, ease: [0.45, 0.05, 0.55, 0.95] }}
                className="relative z-10 w-16 h-48 md:w-20 md:h-64 cursor-pointer"
                onClick={spinBottle}
              >
                {/* Visual Bottle Shape */}
                <div className="w-full h-full bg-gradient-to-b from-zentry-copper via-zentry-copper/80 to-zentry-copper rounded-full shadow-[0_0_30px_rgba(196,132,70,0.3)] flex items-start justify-center pt-4">
                  <div className="w-4 h-4 bg-black/20 rounded-full"></div> {/* Bottle Cap */}
                </div>
              </motion.div>
            </div>

            {/* ACTION FOOTER */}
            <div className="mt-20 text-center">
              {selectedPlayer && !isSpinning ? (
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                  <h3 className="text-gray-500 font-mono text-sm uppercase mb-2">The bottle chose</h3>
                  <h2 className="text-5xl font-black text-zentry-copper italic uppercase mb-8">{selectedPlayer.name}</h2>
                  <div className="flex gap-4">
                    <button className="px-8 py-3 bg-white text-black font-black uppercase italic rounded-lg">Truth</button>
                    <button className="px-8 py-3 bg-white text-black font-black uppercase italic rounded-lg">Dare</button>
                  </div>
                </motion.div>
              ) : (
                <div className="font-mono text-gray-500 uppercase tracking-widest animate-pulse">
                  {isSpinning ? "The wheel of fate is turning..." : "Tap the bottle to spin"}
                </div>
              )}
            </div>
            
            <button 
              onClick={() => { setPhase('category'); setSelectedPlayer(null); }}
              className="absolute top-0 right-0 p-2 text-gray-700 hover:text-white transition-colors"
            >
              <RotateCcw size={20} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OfflineGame;