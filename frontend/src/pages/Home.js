import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Flame, Heart, Skull, Smile, Users, Smartphone, Zap, Database, ChevronDown } from 'lucide-react';
import api from '../api';

const Home = () => {
  const [username, setUsername] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [playType, setPlayType] = useState('online'); // NEW: Tracks Online vs Offline
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  // Background Particle Animation (Fixed to background so it stays while scrolling)
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let w, h;
    const pts = [];

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    const colors = ['255,45,120', '0,232,255', '157,0,255'];
    for (let i = 0; i < 60; i++) {
      pts.push({
        x: Math.random(),
        y: Math.random(),
        r: Math.random() * 1.5 + 0.5,
        vx: (Math.random() - 0.5) * 0.001,
        vy: (Math.random() - 0.5) * 0.001,
        c: colors[i % 3],
        a: Math.random() * 0.3 + 0.05
      });
    }

    let animationFrameId;
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      pts.forEach(p => {
        p.x = (p.x + p.vx + 1) % 1;
        p.y = (p.y + p.vy + 1) % 1;
        ctx.beginPath();
        ctx.arc(p.x * w, p.y * h, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.c},${p.a})`;
        ctx.fill();
      });
      animationFrameId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Backend Authentication & Room Logic
  const authenticateUser = async () => {
    if (!username) return alert("Please enter a username!");
    try {
      const res = await api.post('/auth/login', { username, password: 'darewheel_party' });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('username', res.data.username);
    } catch (err) {
      try {
        const res = await api.post('/auth/register', { username, password: 'darewheel_party' });
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('username', res.data.username);
      } catch (registerErr) {
        console.error("Auth Error:", registerErr);
        alert("Cannot connect to server. Is your Node.js backend running?");
        throw registerErr;
      }
    }
  };

  const handleCreateRoom = async () => {
    setLoading(true);
    try {
      await authenticateUser();
      const res = await api.post('/rooms/create', { name: `${username}'s Room`, mode: 'normal' });
      navigate(`/room/${res.data.roomCode}`);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const handleJoinRoom = async () => {
    if (!roomCode) return alert("Enter a Room Code!");
    setLoading(true);
    try {
      await authenticateUser();
      const res = await api.post('/rooms/join', { roomCode: roomCode.toUpperCase() });
      navigate(`/room/${res.data.roomCode}`);
    } catch (error) {
      alert(error.response?.data?.message || "Could not join room.");
    }
    setLoading(false);
  };

  // Animation Variants
  const fadeUp = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8 } }
  };

  return (
    <div style={{ position: 'relative', width: '100vw', overflowX: 'hidden' }}>
      
      {/* Fixed Background Canvas */}
      <canvas 
        ref={canvasRef} 
        style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }}
      />

      {/* Navigation Bar */}
      <nav style={{ position: 'fixed', top: 0, width: '100%', padding: '20px 50px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 100, background: 'rgba(4,4,15,0.8)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2rem', letterSpacing: '2px' }}>
          DARE<span style={{ color: 'var(--pink)' }}>WHEEL</span>
        </div>
        <div style={{ display: 'flex', gap: '30px' }}>
          <a href="#features" style={{ color: 'white', textDecoration: 'none', fontFamily: "'Rajdhani'", fontWeight: 600, textTransform: 'uppercase' }}>Features</a>
          <a href="#modes" style={{ color: 'white', textDecoration: 'none', fontFamily: "'Rajdhani'", fontWeight: 600, textTransform: 'uppercase' }}>Modes</a>
          <a href="#play" style={{ color: 'var(--cyan)', textDecoration: 'none', fontFamily: "'Rajdhani'", fontWeight: 700, textTransform: 'uppercase' }}>Play Now</a>
        </div>
      </nav>

      <div style={{ position: 'relative', zIndex: 1 }}>
        
        {/* HERO SECTION */}
        <section style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '0 20px' }}>
          <motion.div initial="hidden" animate="visible" variants={fadeUp}>
            <span style={{ fontFamily: "'Syne Mono', monospace", color: 'var(--cyan)', letterSpacing: '3px', textTransform: 'uppercase', fontSize: '0.9rem' }}>
              // Redefining Game Night
            </span>
            <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(5rem, 12vw, 8rem)', lineHeight: '0.85', margin: '20px 0', textShadow: '0 0 30px rgba(255, 45, 120, 0.4)' }}>
              SPIN THE <br/><span style={{ color: 'var(--pink)' }}>BOTTLE.</span>
            </h1>
            <p style={{ color: '#aaa', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto 40px', lineHeight: '1.6' }}>
              Experience the ultimate real-time multiplayer Truth or Dare. Featuring realistic swipe physics, 1,500+ handcrafted questions, and absolutely zero boundaries.
            </p>
            <a href="#play">
              <button className="nav-cta" style={{ fontSize: '1.3rem', padding: '15px 40px' }}>START PLAYING</button>
            </a>
          </motion.div>
          <motion.div 
            animate={{ y: [0, 10, 0] }} 
            transition={{ repeat: Infinity, duration: 2 }}
            style={{ position: 'absolute', bottom: '40px', color: 'rgba(255,255,255,0.5)' }}
          >
            <ChevronDown size={40} />
          </motion.div>
        </section>

        {/* FEATURES SECTION */}
        <section id="features" style={{ padding: '100px 20px', background: 'radial-gradient(ellipse at center, rgba(0,232,255,0.05) 0%, transparent 70%)' }}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '4rem', letterSpacing: '2px' }}>THE TECHNOLOGY</h2>
            <p style={{ color: 'var(--cyan)', fontFamily: "'Syne Mono', monospace", textTransform: 'uppercase' }}>// Built for seamless chaos</p>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', maxWidth: '1200px', margin: '0 auto' }}>
            {[
              { icon: <Smartphone size={40} color="#ff2d78"/>, title: "Swipe-to-Spin Physics", desc: "Interact with a realistic 3D bottle. Your swipe velocity is calculated and synced across all devices instantly." },
              { icon: <Zap size={40} color="#00e8ff"/>, title: "Real-Time WebSockets", desc: "Powered by Socket.io, watch the bottle spin on your friends' screens at the exact same millisecond it spins on yours." },
              { icon: <Database size={40} color="#9d00ff"/>, title: "Massive NoSQL Database", desc: "Over 1,500 uniquely categorized Truths and Dares, pulled instantly using hyper-fast MongoDB aggregations." }
            ].map((feat, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { delay: i * 0.2 } } }} 
                style={{ background: 'var(--card)', border: '1px solid var(--card-b)', padding: '40px', borderRadius: '15px', textAlign: 'center', backdropFilter: 'blur(10px)' }}>
                <div style={{ marginBottom: '20px' }}>{feat.icon}</div>
                <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2rem', marginBottom: '15px' }}>{feat.title}</h3>
                <p style={{ color: '#aaa', lineHeight: '1.6' }}>{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* MODES SECTION */}
        <section id="modes" style={{ padding: '100px 20px', background: 'rgba(0,0,0,0.3)' }}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '4rem', letterSpacing: '2px' }}>CHOOSE YOUR POISON</h2>
            <p style={{ color: 'var(--pink)', fontFamily: "'Syne Mono', monospace", textTransform: 'uppercase' }}>// 5 unique game modes</p>
          </motion.div>

          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            {[
              { icon: <Smile/>, name: "Normal", color: "#4facfe", desc: "Fun, embarrassing, and perfect for friends." },
              { icon: <Flame/>, name: "Flirty", color: "#ff6520", desc: "Playful teasing and romantic tension." },
              { icon: <Heart/>, name: "Couples", color: "#ff2d78", desc: "Deep intimacy and unfiltered secrets." },
              { icon: <Skull/>, name: "Hardcore", color: "#9d00ff", desc: "Taboo, scandalous, and absolutely no limits." },
              { icon: <Users/>, name: "Family", color: "#b8ff00", desc: "Wholesome, safe, and silly fun for everyone." }
            ].map((mode, i) => (
              <motion.div key={i} whileHover={{ y: -10, borderColor: mode.color }} style={{ width: '220px', background: 'var(--card)', border: '1px solid var(--card-b)', padding: '30px 20px', borderRadius: '15px', textAlign: 'center', cursor: 'pointer', transition: 'border-color 0.3s' }}>
                <div style={{ color: mode.color, marginBottom: '15px', display: 'flex', justifyContent: 'center' }}>{mode.icon}</div>
                <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.8rem', letterSpacing: '1px' }}>{mode.name}</h3>
                <p style={{ color: '#888', fontSize: '0.9rem', marginTop: '10px' }}>{mode.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* PLAY SECTION (The actual App Logic) */}
        <section id="play" style={{ padding: '120px 20px', display: 'flex', justifyContent: 'center' }}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} style={{ background: 'rgba(255,45,120,0.05)', border: '1px solid rgba(255,45,120,0.2)', padding: '50px', borderRadius: '20px', maxWidth: '500px', width: '100%', textAlign: 'center', backdropFilter: 'blur(20px)' }}>
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '3.5rem', marginBottom: '20px' }}>ENTER THE ARENA</h2>
            
            {/* ONLINE / OFFLINE TOGGLE */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '25px' }}>
              <button 
                onClick={() => setPlayType('online')}
                style={{ flex: 1, padding: '12px', background: playType === 'online' ? 'var(--pink)' : 'rgba(255,255,255,0.05)', color: 'white', border: `1px solid ${playType === 'online' ? 'var(--pink)' : 'rgba(255,255,255,0.2)'}`, borderRadius: '8px', cursor: 'pointer', fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.3rem', letterSpacing: '1px', transition: '0.3s' }}
              >
                ONLINE
              </button>
              <button 
                onClick={() => setPlayType('offline')}
                style={{ flex: 1, padding: '12px', background: playType === 'offline' ? 'var(--cyan)' : 'rgba(255,255,255,0.05)', color: 'white', border: `1px solid ${playType === 'offline' ? 'var(--cyan)' : 'rgba(255,255,255,0.2)'}`, borderRadius: '8px', cursor: 'pointer', fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.3rem', letterSpacing: '1px', transition: '0.3s' }}
              >
                OFFLINE
              </button>
            </div>

            <input type="text" className="glass-input" placeholder={playType === 'online' ? "Choose your Username" : "Enter Host Name"} value={username} onChange={(e) => setUsername(e.target.value)} />
            
            <button className="nav-cta" style={{ width: '100%', marginBottom: playType === 'online' ? '30px' : '0' }} onClick={handleCreateRoom} disabled={loading || !username}>
              {loading ? 'LOADING...' : (playType === 'online' ? 'HOST A NEW GAME' : 'START LOCAL GAME')}
            </button>

            {/* ONLY SHOW JOIN BOX IF ONLINE IS SELECTED */}
            {playType === 'online' && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0', color: '#6868a0' }}>
                  <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
                  <span style={{ padding: '0 15px', fontFamily: "'Syne Mono', monospace", textTransform: 'uppercase', fontSize: '0.8rem' }}>OR JOIN EXISTING</span>
                  <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
                </div>

                <input type="text" className="glass-input" placeholder="ROOM CODE (e.g. AB12CD)" style={{ textTransform: 'uppercase', fontFamily: "'Syne Mono', monospace", letterSpacing: '2px' }} value={roomCode} onChange={(e) => setRoomCode(e.target.value)} />
                
                <button className="nav-cta cyan-btn" style={{ width: '100%' }} onClick={handleJoinRoom} disabled={loading || !username || !roomCode}>
                  JOIN GAME
                </button>
              </motion.div>
            )}

          </motion.div>
        </section>

        {/* FOOTER */}
        <footer style={{ background: 'rgba(0,0,0,0.8)', padding: '40px 50px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.5rem', letterSpacing: '2px', color: '#aaa' }}>
              DARE<span style={{ color: 'var(--pink)' }}>WHEEL</span>
            </div>
            <p style={{ color: '#6868a0', fontSize: '0.9rem', marginTop: '5px' }}>
              A product of <strong style={{ color: 'white' }}>Zentry Hub Private Limited</strong>
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '20px' }}>
            <a href="#" style={{ color: '#6868a0', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }} onMouseOver={e=>e.target.style.color='var(--cyan)'} onMouseOut={e=>e.target.style.color='#6868a0'}>Terms and Conditions</a>
            <a href="#" style={{ color: '#6868a0', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }} onMouseOver={e=>e.target.style.color='var(--cyan)'} onMouseOut={e=>e.target.style.color='#6868a0'}>Privacy Policy</a>
            <a href="#" style={{ color: '#6868a0', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }} onMouseOver={e=>e.target.style.color='var(--cyan)'} onMouseOut={e=>e.target.style.color='#6868a0'}>Contact Us</a>
          </div>
        </footer>

      </div>
    </div>
  );
};

export default Home;