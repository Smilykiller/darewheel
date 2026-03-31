import React, { useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';

const Bottle = ({ socket, roomCode, isHost, players, onTurnAssigned }) => {
  const controls = useAnimation();
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentRotation, setCurrentRotation] = useState(0);

  useEffect(() => {
    if (!socket) return;

    // Listen for the backend telling us someone else swiped the bottle!
    socket.on('bottle_is_spinning', ({ targetRotation }) => {
      setIsSpinning(true);
      setCurrentRotation(targetRotation);
      
      controls.start({
        rotate: targetRotation,
        transition: { type: 'spring', damping: 15, mass: 1.2, stiffness: 40 }
      }).then(() => {
        setIsSpinning(false);
      });
    });

    return () => socket.off('bottle_is_spinning');
  }, [socket, controls]);

  // THIS IS THE SWIPE PHYSICS ENGINE
  const handlePanEnd = (e, info) => {
    if (isSpinning) return;
    
    // 1. Calculate how hard the user swiped (Velocity)
    const swipeVelocity = Math.sqrt(info.velocity.x ** 2 + info.velocity.y ** 2);
    
    // If it was just a tiny tap, ignore it
    if (swipeVelocity < 100) return;

    setIsSpinning(true);

    // 2. Calculate how many times it should spin based on swipe speed
    const extraSpins = Math.floor(swipeVelocity / 150) * 360;
    const randomOffset = Math.floor(Math.random() * 360); // So it doesn't land in the exact same spot
    const targetRotation = currentRotation + extraSpins + randomOffset + 1440; // At least 4 full spins

    setCurrentRotation(targetRotation);

    // 3. Tell the Node.js backend to spin everyone else's bottle!
    socket.emit('spin_bottle', { roomCode, targetRotation });

    // 4. Animate our local bottle with spring physics
    controls.start({
      rotate: targetRotation,
      transition: { type: 'spring', damping: 15, mass: 1.2, stiffness: 40 }
    }).then(() => {
      setIsSpinning(false);
      
      // Calculate who it landed on
      const normalizedAngle = targetRotation % 360;
      const playerIndex = Math.floor(normalizedAngle / (360 / players.length));
      
      // The array order is circular, but rotation is clockwise. We reverse it mentally to map it properly.
      const actualIndex = players.length - 1 - playerIndex;
      const selectedPlayer = players[actualIndex] || players[0];
      
      if (onTurnAssigned) {
        onTurnAssigned(selectedPlayer);
      }
    });
  };

  return (
    <div style={{ position: 'relative', width: '350px', height: '350px', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '40px auto' }}>
      
      {/* Draw the Players in a perfect circle around the bottle */}
      {players.map((player, idx) => {
        // Math to position them in a circle
        const angle = (idx * (360 / players.length) - 90) * (Math.PI / 180);
        const radius = 160;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;

        return (
          <motion.div 
            key={idx} 
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            style={{
              position: 'absolute',
              transform: `translate(${x}px, ${y}px)`,
              background: 'var(--deep2)', 
              border: '2px solid var(--card-b)',
              padding: '10px 20px', 
              borderRadius: '20px', 
              fontWeight: '600',
              color: 'var(--white)',
              boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
              zIndex: 10
            }}
          >
            {player.username || `Player ${idx + 1}`}
          </motion.div>
        );
      })}

      {/* The Draggable Glowing Bottle */}
      <motion.div
        onPanEnd={handlePanEnd}
        animate={controls}
        style={{
          width: '60px',
          height: '220px',
          background: 'linear-gradient(180deg, var(--cyan), var(--pink))',
          borderRadius: '30px 30px 10px 10px',
          cursor: isSpinning ? 'default' : 'grab',
          boxShadow: '0 0 40px rgba(255, 45, 120, 0.6), inset 0 0 20px rgba(255,255,255,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          paddingTop: '10px',
          zIndex: 5
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ cursor: 'grabbing', scale: 0.95 }}
      >
        {/* The Bottle Cap (points to the user) */}
        <div style={{ width: '24px', height: '30px', background: '#fff', borderRadius: '5px', boxShadow: '0 0 15px #fff' }} />
      </motion.div>
    </div>
  );
};

export default Bottle;