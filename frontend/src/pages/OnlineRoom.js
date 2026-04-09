import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import socket from '../socket'; // Goes up one folder to find socket.js!

const OnlineRoom = () => {
  const { roomCode } = useParams();
  const location = useLocation();
  const myUsername = location.state?.username || "Guest"; 

  const [players, setPlayers] = useState([]);

  useEffect(() => {
    socket.emit('join_room', roomCode, myUsername);

    socket.on('room_data', (currentPlayers) => {
      setPlayers(currentPlayers);
    });

    socket.on('player_joined', (newPlayer) => {
      setPlayers((prev) => [...prev, newPlayer]);
    });

    socket.on('player_left', (disconnectedId) => {
      setPlayers((prev) => prev.filter(p => p.id !== disconnectedId));
    });

    return () => {
      socket.off('room_data');
      socket.off('player_joined');
      socket.off('player_left');
    };
  }, [roomCode, myUsername]);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center pt-20">
      <h1 className="text-4xl font-bold text-zentry-copper mb-2">ROOM CODE: {roomCode}</h1>
      <p className="text-gray-400 mb-10">Waiting for players to join...</p>

      <div className="w-full max-w-md bg-white/[0.05] border border-white/10 rounded-xl p-6">
        <h2 className="text-xl font-mono tracking-widest border-b border-white/10 pb-4 mb-4">
          CONNECTED PLAYERS
        </h2>
        <ul className="space-y-3">
          {players.map((player) => (
            <li key={player.id} className="flex items-center gap-3 bg-black/50 p-3 rounded-lg border border-white/5">
              <div className={`w-3 h-3 rounded-full ${player.id === socket.id ? 'bg-green-500' : 'bg-zentry-copper'}`}></div>
              <span className="font-bold text-lg">
                {player.username} {player.id === socket.id && <span className="text-xs text-gray-500 font-mono">(You)</span>}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default OnlineRoom;
