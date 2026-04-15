import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Copy, ArrowLeft } from 'lucide-react';
import socket from '../socket';
import ChatBox from '../components/ChatBox';

const OnlineRoom = () => {
  const { roomCode } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const myUsername = location.state?.username || "Guest"; 

  const [players, setPlayers] = useState([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // 1. Join the room
    socket.emit('join_room', roomCode, myUsername);

    // 2. Receive the list of players
    socket.on('room_data', (currentPlayers) => {
      // FIX: Deduplicate the array in case React Strict Mode fired twice
      const uniquePlayers = Array.from(new Map(currentPlayers.map(item => [item.username, item])).values());
      setPlayers(uniquePlayers);
    });

    // 3. Listen for new players
    socket.on('player_joined', (newPlayer) => {
      setPlayers((prev) => {
        // FIX: Prevent adding someone if they are already in the list
        if (prev.some(p => p.username === newPlayer.username)) return prev;
        return [...prev, newPlayer];
      });
    });

    // 4. Listen for disconnects
    socket.on('player_left', (disconnectedId) => {
      setPlayers((prev) => prev.filter(p => p.id !== disconnectedId));
    });

    return () => {
      socket.off('room_data');
      socket.off('player_joined');
      socket.off('player_left');
    };
  }, [roomCode, myUsername]);

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center pt-20 px-6 relative overflow-hidden">
      
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] bg-zentry-copper/5 rounded-full blur-[150px] pointer-events-none"></div>

      {/* Header */}
      <div className="w-full max-w-2xl flex justify-between items-center mb-10 z-10">
        <button onClick={() => navigate('/')} className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <ArrowLeft size={24} />
        </button>
        <div className="font-black tracking-tighter text-xl">
          DARE<span className="text-zentry-copper">WHEEL</span>
        </div>
        <div className="w-10"></div> {/* Spacer for centering */}
      </div>

      {/* Main Lobby Panel */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white/[0.03] border border-white/10 rounded-2xl p-8 backdrop-blur-xl z-10"
      >
        <div className="text-center mb-8">
          <p className="text-gray-500 font-mono tracking-widest text-xs uppercase mb-2">Game Lobby</p>
          <div 
            onClick={copyRoomCode}
            className="inline-flex items-center gap-3 bg-black/50 border border-zentry-copper/30 px-6 py-3 rounded-lg cursor-pointer hover:border-zentry-copper transition-colors group"
          >
            <h1 className="text-4xl font-black tracking-[0.2em]">{roomCode}</h1>
            <Copy size={20} className={`${copied ? 'text-green-400' : 'text-gray-500 group-hover:text-white'} transition-colors`} />
          </div>
          {copied && <p className="text-green-400 font-mono text-xs mt-2">COPIED TO CLIPBOARD</p>}
        </div>

        <div className="mb-6 flex justify-between items-end border-b border-white/10 pb-2">
          <h2 className="text-sm font-bold tracking-widest flex items-center gap-2">
            <Users size={16} className="text-zentry-copper" /> CONNECTED
          </h2>
          <span className="font-mono text-xs text-gray-500">{players.length} / 12 PLAYERS</span>
        </div>
        
        <ul className="space-y-3 mb-10">
          {players.length === 0 ? (
             <li className="text-center text-gray-600 font-mono text-sm py-4 animate-pulse">Waiting for server...</li>
          ) : (
            players.map((player, index) => (
              <motion.div 
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }}
                key={index} 
                className="flex items-center gap-3 bg-black/40 p-4 rounded-xl border border-white/5"
              >
                <div className={`w-2 h-2 rounded-full ${player.username === myUsername ? 'bg-zentry-copper shadow-[0_0_10px_#C48446]' : 'bg-gray-500'}`}></div>
                <span className="font-bold text-lg tracking-wide">
                  {player.username} 
                  {player.username === myUsername && <span className="ml-2 text-xs text-zentry-copper font-mono uppercase tracking-widest bg-zentry-copper/10 px-2 py-1 rounded">You</span>}
                </span>
              </motion.div>
            ))
          )}
        </ul>

        <button 
          disabled={players.length < 2}
          className="w-full bg-zentry-copper text-black font-black py-4 rounded-xl tracking-widest uppercase disabled:opacity-30 transition-all hover:bg-white"
        >
          {players.length < 2 ? 'Waiting for players...' : 'Start Game'}
        </button>
      </motion.div>
      <ChatBox roomCode={roomCode} username={myUsername} />
    </div>
  );
};

export default OnlineRoom;