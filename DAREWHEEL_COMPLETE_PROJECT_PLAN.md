# 🎡 DAREWHEEL - Complete Project Documentation

**Version:** 1.0  
**Date:** March 2026  
**Status:** Full Development Ready  
**Scope:** MVP Phase + Premium Infrastructure

---

## 📋 TABLE OF CONTENTS

1. [Executive Summary](#executive-summary)
2. [Product Overview](#product-overview)
3. [Technical Architecture](#technical-architecture)
4. [Project Structure](#project-structure)
5. [Database Schema](#database-schema)
6. [API Specification](#api-specification)
7. [Game Modes & Features](#game-modes--features)
8. [Game Questions Database (200+ per mode)](#game-questions-database)
9. [Blog Categories](#blog-categories)
10. [UI/UX Specifications](#uiux-specifications)
11. [Terms & Conditions](#terms--conditions)
12. [Development Phases & Timeline](#development-phases--timeline)
13. [Deployment Strategy](#deployment-strategy)

---

## 🎯 EXECUTIVE SUMMARY

**DareWheel** is an innovative, dual-mode (Offline/Online) Truth or Dare gaming platform designed for college students, office staff (25-30), couples, and IT professionals. Unlike traditional Truth or Dare websites, DareWheel introduces:

- **Offline Mode**: Local party gaming with manual player setup and spinning wheel
- **Online Mode**: Remote room-based gaming with creative chat (text/audio/video), real-time synchronization, and remote-friendly dares
- **6 Game Modes**: Normal, Flirty, Couples, Hardcore, Family-Friendly, Own Mode
- **200+ Questions per Mode**: Randomly shuffled, cross-mode compatible, difficulty-scaled
- **Gamification**: Points, streaks, achievements, leaderboards
- **Premium Architecture**: Ready for future monetization (analytics, user-generated questions, referral system)
- **Zero Data Persistence**: All media & room data auto-deleted after 10 min inactivity
- **Privacy-First**: No downloads, watermarked media, end-to-end encryption

---

## 🎮 PRODUCT OVERVIEW

### **Core USPs (Unique Selling Points)**

1. **Dual-Mode Architecture** - Only platform with true offline + online gaming
2. **Remote-Friendly Dares** - Dares designed for online settings (not "kiss the person next to you")
3. **Creative Chat System** - Text + Audio + Video in-game communication
4. **Privacy-First Design** - No storage, no downloads, no screenshots
5. **Gamification** - Full progression system (points, streaks, badges)
6. **Age-Appropriate Categories** - Family-Friendly mode for all ages
7. **Modern UI** - Dark theme, neon accents, bold typography

### **Target Audience**

| Segment | Age | Use Case |
|---------|-----|----------|
| College Students | 18-24 | Party gaming, social bonding |
| Office Teams | 25-35 | Team building, after-hours fun |
| Couples | Any | Relationship spice, date night |
| Tech Community | 20-40 | Own Mode, custom challenges |
| Families | All Ages | Family-Friendly mode |

### **Revenue Model (Phase 2+)**

| Tier | Features | Pricing |
|------|----------|---------|
| **Free (MVP)** | All core features | $0 |
| **Premium** | Analytics, custom questions, referral rewards | TBD |
| **Team/Enterprise** | Host dashboard, team analytics | TBD |

---

## 🛠️ TECHNICAL ARCHITECTURE

### **Tech Stack**

```
┌─────────────────────────────────────────────────────────┐
│                    DAREWHEEL TECH STACK                 │
├─────────────────────────────────────────────────────────┤
│ Frontend:       React 18 + Vite + TailwindCSS           │
│ State Mgmt:     Redux Toolkit + React Query             │
│ Real-Time:      Socket.io (WebSocket signaling)         │
│ Media:          WebRTC (peer-to-peer video/audio)       │
│ Animation:      Framer Motion + Canvas API              │
│ Styling:        TailwindCSS + CSS-in-JS                 │
│ Package Mgr:    npm/yarn                                │
├─────────────────────────────────────────────────────────┤
│ Backend:        Node.js + Express.js                    │
│ Real-Time:      Socket.io server                        │
│ Authentication: JWT + bcryptjs                          │
│ Validation:     Joi/Zod schema validation               │
│ Logging:        Winston + Morgan                        │
│ Testing:        Jest + Supertest                        │
│ Package Mgr:    npm                                     │
├─────────────────────────────────────────────────────────┤
│ Database:       PostgreSQL (persistent data)            │
│ Cache/Session:  Redis (room states, temp data)          │
│ Cloud Storage:  AWS S3 (blog images, static assets)     │
│ Deployment:     Docker + Kubernetes (future)            │
│ CDN:            Cloudflare (static assets)              │
├─────────────────────────────────────────────────────────┤
│ Environment:    Node 18+, npm 9+, Python 3.9+ (scripts) │
└─────────────────────────────────────────────────────────┘
```

### **Architecture Diagram**

```
┌──────────────────────────────────────────────────────────────┐
│                         DAREWHEEL FLOW                       │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────┐           ┌──────────────────┐         │
│  │  React Client   │◄─────────►│ Socket.io Server │         │
│  │  (Web/Mobile)   │ WebSocket │   (Real-Time)    │         │
│  └────────┬────────┘           └────────┬─────────┘         │
│           │                             │                   │
│           │ HTTPS                       │ Room Events      │
│           │                             │                   │
│  ┌────────▼────────┐           ┌────────▼──────────┐        │
│  │  Express.js API │◄─────────►│ Redis Cache       │        │
│  │  (REST routes)  │ JSON      │ (Session/Rooms)   │        │
│  └────────┬────────┘           └───────────────────┘        │
│           │                                                  │
│           │ SQL                                              │
│           │                                                  │
│  ┌────────▼────────┐           ┌───────────────────┐        │
│  │   PostgreSQL    │           │  WebRTC Signaling │        │
│  │  (Persistent)   │           │  (Media P2P)      │        │
│  └─────────────────┘           └───────────────────┘        │
│                                                              │
│  ┌──────────────────────┐      ┌──────────────────┐         │
│  │  AWS S3 + Cloudflare │      │  Blog Content    │         │
│  │  (Static Assets)     │      │  (Static Pages)  │         │
│  └──────────────────────┘      └──────────────────┘         │
│                                                              │
└──────────────────────────────────────────────────────────────┘

KEY FLOWS:

1. OFFLINE MODE:
   Player 1 → Add Names → Spin Wheel → Socket.io broadcast → 
   All players see spinner → Select player → T/D choice → Display question

2. ONLINE MODE:
   Host → Create Room → Share code → Players join → 
   Socket.io sync → Wheel auto-connects names → Real-time chat → 
   Media stream (WebRTC) → Auto-delete after 10 min

3. MEDIA HANDLING:
   Video/Audio → WebRTC peer-to-peer → Base64 in memory → 
   CSS watermark → Auto-delete on room close
```

### **Data Flow: Room Lifecycle**

```
ROOM CREATION:
┌─────────────────────────────────────────────────────────┐
│ 1. Host creates room → Room ID generated (6-char code)  │
│ 2. Room stored in Redis with TTL = 10 min               │
│ 3. Room state: {id, hostId, players[], mode, active}   │
│ 4. Socket.io room created for broadcasting              │
└─────────────────────────────────────────────────────────┘

PLAYER JOINS:
┌─────────────────────────────────────────────────────────┐
│ 1. Player enters room code + name                       │
│ 2. Backend validates code exists in Redis               │
│ 3. Add player to room.players[] array                   │
│ 4. Broadcast to all: {event: 'playerJoined', name}    │
│ 5. Frontend updates wheel with new player name          │
└─────────────────────────────────────────────────────────┘

GAME PLAY:
┌─────────────────────────────────────────────────────────┐
│ 1. Player spins wheel → Random selection                │
│ 2. Selected player shown on all screens                 │
│ 3. Player chooses: Truth / Dare / Random               │
│ 4. Question retrieved from questions DB                 │
│ 5. Player answers via chat (text/audio/video)          │
│ 6. Media streamed via WebRTC (not stored)              │
│ 7. Points awarded, streak updated in Redis             │
└─────────────────────────────────────────────────────────┘

ROOM CLEANUP:
┌─────────────────────────────────────────────────────────┐
│ Trigger 1: All players exit room                        │
│ Trigger 2: 10 minutes inactivity                        │
│ Action:                                                  │
│ - Delete room from Redis                                │
│ - Close Socket.io room                                  │
│ - Delete any temp media (if any stored)                │
│ - Log room stats to PostgreSQL (for analytics)          │
└─────────────────────────────────────────────────────────┘
```

### **Security Architecture**

```
1. AUTHENTICATION:
   - JWT tokens (access + refresh tokens)
   - HTTP-only cookies for token storage
   - Token expiry: 15 min access, 7 days refresh

2. ROOM ACCESS CONTROL:
   - Room codes are 6-character alphanumeric
   - Room codes expire after 10 min if no one joins
   - Players verified via Socket.io middleware
   - Host can kick players

3. MEDIA SECURITY:
   - WebRTC encryption (DTLS-SRTP)
   - Base64 encoding for in-memory storage
   - CSS watermark on video (prevents clean screenshot)
   - Browser media stream API (direct peer-to-peer, not server)
   - Auto-delete on room close

4. DATA PRIVACY:
   - Passwords hashed with bcryptjs (12 rounds)
   - GDPR compliant data deletion
   - No personally identifiable info in room logs
   - HTTPS/TLS for all connections

5. RATE LIMITING:
   - 10 room creations per IP per hour
   - 100 messages per player per minute
   - Sliding window rate limiter
```

---

## 📁 PROJECT STRUCTURE

```
darewheel/
├── frontend/
│   ├── public/
│   │   ├── favicon.ico
│   │   ├── logo.png
│   │   └── sounds/
│   │       ├── spin.mp3
│   │       ├── select.mp3
│   │       └── success.mp3
│   ├── src/
│   │   ├── index.jsx
│   │   ├── App.jsx
│   │   ├── vite-env.d.ts
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── OfflineMode.jsx
│   │   │   ├── OnlineMode.jsx
│   │   │   ├── CreateRoom.jsx
│   │   │   ├── JoinRoom.jsx
│   │   │   ├── GamePlay.jsx
│   │   │   ├── Blog.jsx
│   │   │   ├── BlogDetail.jsx
│   │   │   ├── Terms.jsx
│   │   │   └── NotFound.jsx
│   │   ├── components/
│   │   │   ├── SpinningWheel.jsx
│   │   │   ├── PlayerSelection.jsx
│   │   │   ├── QuestionDisplay.jsx
│   │   │   ├── ChatBox.jsx
│   │   │   ├── MediaViewer.jsx
│   │   │   ├── Leaderboard.jsx
│   │   │   ├── Timer.jsx
│   │   │   ├── Notifications.jsx
│   │   │   ├── AchievementBadge.jsx
│   │   │   ├── Modal.jsx
│   │   │   └── Header.jsx
│   │   ├── hooks/
│   │   │   ├── useSocket.js
│   │   │   ├── useGameState.js
│   │   │   ├── useWebRTC.js
│   │   │   └── useLocalStorage.js
│   │   ├── store/
│   │   │   ├── gameSlice.js
│   │   │   ├── playerSlice.js
│   │   │   ├── uiSlice.js
│   │   │   └── store.js
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   ├── socketService.js
│   │   │   └── webrtcService.js
│   │   ├── styles/
│   │   │   ├── globals.css
│   │   │   ├── tailwind.config.js
│   │   │   └── animations.css
│   │   ├── utils/
│   │   │   ├── constants.js
│   │   │   ├── helpers.js
│   │   │   └── validators.js
│   │   └── assets/
│   │       ├── images/
│   │       ├── icons/
│   │       └── fonts/
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── backend/
│   ├── src/
│   │   ├── index.js (entry point)
│   │   ├── config/
│   │   │   ├── database.js
│   │   │   ├── redis.js
│   │   │   ├── socket.js
│   │   │   └── env.js
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── game.routes.js
│   │   │   ├── blog.routes.js
│   │   │   ├── user.routes.js
│   │   │   └── health.routes.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── gameController.js
│   │   │   ├── blogController.js
│   │   │   └── userController.js
│   │   ├── services/
│   │   │   ├── gameService.js
│   │   │   ├── questionService.js
│   │   │   ├── roomService.js
│   │   │   ├── userService.js
│   │   │   └── blogService.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── GameRoom.js
│   │   │   ├── GameSession.js
│   │   │   ├── Question.js
│   │   │   ├── BlogPost.js
│   │   │   └── UserStats.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   ├── errorHandler.js
│   │   │   ├── validation.js
│   │   │   ├── rateLimiter.js
│   │   │   └── logger.js
│   │   ├── socket/
│   │   │   ├── handlers.js
│   │   │   ├── events.js
│   │   │   └── middleware.js
│   │   ├── utils/
│   │   │   ├── generateCode.js
│   │   │   ├── tokenManager.js
│   │   │   ├── questionRandomizer.js
│   │   │   └── validators.js
│   │   └── database/
│   │       ├── migrations/
│   │       │   ├── 001_create_users.sql
│   │       │   ├── 002_create_questions.sql
│   │       │   ├── 003_create_blog.sql
│   │       │   └── 004_create_stats.sql
│   │       ├── seeds/
│   │       │   └── questionSeed.js
│   │       └── schema.sql
│   ├── tests/
│   │   ├── api.test.js
│   │   ├── socket.test.js
│   │   └── game.test.js
│   ├── package.json
│   ├── .env.example
│   ├── Dockerfile
│   └── docker-compose.yml
│
├── docs/
│   ├── API_DOCS.md
│   ├── SOCKET_EVENTS.md
│   ├── DATABASE_SCHEMA.md
│   └── DEPLOYMENT.md
│
├── .gitignore
├── README.md
└── docker-compose.yml (for full stack)
```

---

## 🗄️ DATABASE SCHEMA

### **PostgreSQL Tables**

#### **1. users**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  avatar_url VARCHAR(255),
  date_of_birth DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP
);

Indexes:
- CREATE INDEX idx_users_email ON users(email);
- CREATE INDEX idx_users_username ON users(username);
```

#### **2. user_stats**
```sql
CREATE TABLE user_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  total_games_played INT DEFAULT 0,
  total_points INT DEFAULT 0,
  current_streak INT DEFAULT 0,
  longest_streak INT DEFAULT 0,
  truths_completed INT DEFAULT 0,
  dares_completed INT DEFAULT 0,
  achievements TEXT[] DEFAULT '{}',
  level INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);
```

#### **3. questions**
```sql
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mode VARCHAR(50) NOT NULL, -- 'normal', 'flirty', 'couples', 'hardcore', 'family_friendly'
  category VARCHAR(100),
  question_type VARCHAR(20) NOT NULL, -- 'truth' or 'dare'
  question_text TEXT NOT NULL,
  difficulty_level INT DEFAULT 1, -- 1-5 scale
  cross_mode_compatible BOOLEAN DEFAULT FALSE,
  age_restriction INT DEFAULT 18, -- Minimum age
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE
);

Indexes:
- CREATE INDEX idx_questions_mode ON questions(mode);
- CREATE INDEX idx_questions_type ON questions(question_type);
- CREATE INDEX idx_questions_active ON questions(is_active);
```

#### **4. game_sessions**
```sql
CREATE TABLE game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id VARCHAR(10),
  mode VARCHAR(50), -- 'offline' or 'online'
  game_mode VARCHAR(50), -- 'normal', 'flirty', etc.
  host_id UUID REFERENCES users(id) ON DELETE SET NULL,
  players_data JSONB, -- {player_id: {name, points, streak, answered}}
  total_questions_asked INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ended_at TIMESTAMP,
  duration_minutes INT,
  max_points_player_id UUID,
  FOREIGN KEY (max_points_player_id) REFERENCES users(id) ON DELETE SET NULL
);

Indexes:
- CREATE INDEX idx_sessions_room_id ON game_sessions(room_id);
- CREATE INDEX idx_sessions_host ON game_sessions(host_id);
- CREATE INDEX idx_sessions_created ON game_sessions(created_at);
```

#### **5. game_answers** (Optional - for analytics)
```sql
CREATE TABLE game_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES game_sessions(id) ON DELETE CASCADE,
  question_id UUID REFERENCES questions(id),
  answerer_id UUID REFERENCES users(id),
  answer_type VARCHAR(20), -- 'truth', 'dare'
  answer_text TEXT,
  points_earned INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### **6. blog_posts**
```sql
CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  category VARCHAR(100),
  content TEXT NOT NULL,
  excerpt VARCHAR(500),
  featured_image_url VARCHAR(255),
  author_id UUID REFERENCES users(id),
  view_count INT DEFAULT 0,
  is_published BOOLEAN DEFAULT TRUE,
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

Indexes:
- CREATE INDEX idx_blog_slug ON blog_posts(slug);
- CREATE INDEX idx_blog_category ON blog_posts(category);
- CREATE INDEX idx_blog_published ON blog_posts(is_published);
```

#### **7. achievements**
```sql
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon_url VARCHAR(255),
  requirement_type VARCHAR(50), -- 'points', 'games', 'streak', 'completion'
  requirement_value INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

Values (Pre-loaded):
- 'First Blood' - Complete first game
- 'Truth Master' - Complete 50 truths
- 'Dare Devil' - Complete 50 dares
- 'On Fire' - 10-game streak
- 'Social Butterfly' - Play 25 games
- 'Point Collector' - Earn 1000 points
```

### **Redis Data Structures**

```
ACTIVE ROOMS:
Key: room:{roomCode}
Value: {
  id: string,
  hostId: string,
  mode: 'offline' | 'online',
  gameModeSelected: 'normal' | 'flirty' | 'couples' | 'hardcore' | 'family_friendly' | 'own',
  players: [
    { id: string, name: string, points: int, streak: int, answered: bool },
    ...
  ],
  currentPlayer: string,
  currentQuestion: { id: string, text: string, type: 'truth' | 'dare' },
  gameStarted: bool,
  createdAt: timestamp,
  lastActivity: timestamp
}
TTL: 10 minutes (auto-expire)

PLAYER SESSIONS:
Key: session:{userId}:{roomCode}
Value: { connectionId: string, joinedAt: timestamp, active: bool }
TTL: 10 minutes

LEADERBOARD (Per Room):
Key: leaderboard:{roomCode}
Value: Sorted Set with score = points, member = player_id
TTL: 10 minutes

MESSAGES (Recent chat):
Key: messages:{roomCode}
Value: [
  { senderId: string, message: string, timestamp: int, type: 'text' },
  ...
] (Keep last 50 messages)
TTL: 10 minutes
```

---

## 🔌 API SPECIFICATION

### **REST API (Express.js)**

#### **Authentication Endpoints**

```
POST /api/auth/register
Body: {
  email: string,
  username: string,
  password: string,
  date_of_birth: date
}
Response: {
  accessToken: string,
  refreshToken: string,
  user: { id, username, email }
}
Status: 201

POST /api/auth/login
Body: { email/username, password }
Response: { accessToken, refreshToken, user }
Status: 200

POST /api/auth/logout
Headers: { Authorization: "Bearer {token}" }
Status: 204

POST /api/auth/refresh
Body: { refreshToken: string }
Response: { accessToken: string }
Status: 200
```

#### **Game Endpoints**

```
POST /api/game/room/create (ONLINE MODE)
Headers: { Authorization: "Bearer {token}" }
Body: { gameMode: 'normal' | 'flirty' | 'couples' | 'hardcore' | 'family_friendly' | 'own' }
Response: { roomCode: string, roomId: string, joinUrl: string }
Status: 201

GET /api/game/room/{roomCode}/validate
Response: { valid: bool, gameMode: string, playersCount: int }
Status: 200

GET /api/game/questions/{mode}
Response: [{ id, question, type, difficulty }, ...]
Status: 200 (Randomized order)

GET /api/game/leaderboard/{roomCode}
Response: [{ playerId, name, points, streak }, ...]
Status: 200

POST /api/game/answer
Headers: { Authorization: "Bearer {token}" }
Body: { roomCode, questionId, answerType: 'truth' | 'dare', answerText }
Response: { pointsAwarded: int, newStreak: int }
Status: 201

GET /api/user/stats
Headers: { Authorization: "Bearer {token}" }
Response: { totalGames, totalPoints, currentStreak, achievements }
Status: 200

GET /api/user/achievements
Response: [{ id, name, description, earned: bool }, ...]
Status: 200
```

#### **Blog Endpoints**

```
GET /api/blog/posts
Query: ?category=&page=&limit=
Response: { posts: [...], total: int, page: int }
Status: 200

GET /api/blog/posts/{slug}
Response: { id, title, content, author, category, viewCount }
Status: 200 (Increments viewCount)

GET /api/blog/categories
Response: [{ name, slug, postCount }, ...]
Status: 200
```

### **Socket.io Events**

#### **Connection**

```javascript
// Client → Server
socket.emit('joinRoom', { roomCode, playerName, userId? });

// Server → All Clients
socket.on('playerJoined', { playerId, playerName, totalPlayers });
socket.on('roomState', { room: RoomObject });
```

#### **Game Events**

```javascript
// Client → Server
socket.emit('spin', { playerId });
socket.emit('selectTruthOrDare', { choice: 'truth' | 'dare' | 'random' });
socket.emit('submitAnswer', { answerText, answerType: 'text' | 'audio' | 'video' });

// Server → All Clients
socket.on('wheelSpinning', {});
socket.on('playerSelected', { playerId, playerName });
socket.on('questionDisplay', { question, type });
socket.on('answerSubmitted', { playerId, answerType });
socket.on('leaderboardUpdated', [{ playerId, name, points }, ...]);
socket.on('achievementUnlocked', { playerId, achievement });
```

#### **Chat/Media Events**

```javascript
// Client → Server
socket.emit('sendMessage', { text, type: 'text' | 'audio' | 'video', data? });

// Server → All Clients
socket.on('messageBroadcast', { senderId, senderName, text, timestamp });
socket.on('mediaStream', { senderId, mediaUrl (WebRTC), type });
socket.on('typingIndicator', { playerId, isTyping });
```

#### **Room Management**

```javascript
// Client → Server
socket.emit('hostKickPlayer', { playerId });
socket.emit('pauseGame', {});
socket.emit('resumeGame', {});
socket.emit('skipQuestion', {});
socket.emit('leaveRoom', {});

// Server → All Clients
socket.on('playerKicked', { playerId });
socket.on('gamePaused', {});
socket.on('gameResumed', {});
socket.on('questionSkipped', {});
socket.on('playerLeft', { playerId, totalPlayers });
socket.on('roomClosed', { reason });
```

---

## 🎮 GAME MODES & FEATURES

### **6 Game Modes Overview**

| Mode | Target | Questions | Vibe | Age |
|------|--------|-----------|------|-----|
| **Normal** | Everyone | 200+ general questions | Fun, light-hearted | 13+ |
| **Flirty** | Dating/Mixed groups | 200+ romantic questions | Playful, teasing | 16+ |
| **Couples** | Dating couples only | 200+ intimate questions | Romantic, deep | 18+ |
| **Hardcore** | Adults, mature friends | 200+ extreme scenarios | Outrageous, wild | 18+ |
| **Family-Friendly** | All ages | 200+ clean questions | Wholesome, silly | All |
| **Own Mode** | Custom challenges | No pre-loaded | DIY spins | All |

### **Feature Matrix**

```
┌─────────────────────────┬──────────┬────────┬──────────┬─────────────┐
│ Feature                 │ Offline  │ Online │ Premium  │ MVP Status  │
├─────────────────────────┼──────────┼────────┼──────────┼─────────────┤
│ Basic Spinning Wheel    │ ✅       │ ✅     │ N/A      │ ✅ READY    │
│ 6 Game Modes            │ ✅       │ ✅     │ N/A      │ ✅ READY    │
│ 200+ Questions/Mode     │ ✅       │ ✅     │ N/A      │ ✅ READY    │
│ Points System           │ ✅       │ ✅     │ N/A      │ ✅ READY    │
│ Streak Tracking         │ ✅       │ ✅     │ N/A      │ ✅ READY    │
│ Achievements/Badges     │ ✅       │ ✅     │ N/A      │ ✅ READY    │
│ Leaderboard             │ ✅       │ ✅     │ N/A      │ ✅ READY    │
│ Text Chat               │ ❌       │ ✅     │ N/A      │ ✅ READY    │
│ Audio Messages          │ ❌       │ ✅     │ N/A      │ ✅ READY    │
│ Video Streaming         │ ❌       │ ✅     │ N/A      │ ✅ READY    │
│ Turn Queue Vis.         │ ✅       │ ✅     │ N/A      │ ✅ READY    │
│ Host Controls           │ ❌       │ ✅     │ N/A      │ ✅ READY    │
│ Typing Indicators       │ ❌       │ ✅     │ N/A      │ ✅ READY    │
│ Dares Timer             │ ✅       │ ✅     │ N/A      │ ✅ READY    │
│ Notifications           │ ✅       │ ✅     │ N/A      │ ✅ READY    │
│ Sound Effects           │ ✅       │ ✅     │ N/A      │ ✅ READY    │
│ Dark Mode Toggle        │ ✅       │ ✅     │ N/A      │ ✅ READY    │
│ Blog Page               │ ✅       │ ✅     │ N/A      │ ✅ READY    │
│ User Profiles           │ Optional │ ✅     │ N/A      │ ✅ READY    │
│ Game History            │ N/A      │ ✅     │ Premium  │ 📦 Q2       │
│ Analytics Dashboard     │ N/A      │ ✅     │ Premium  │ 📦 Q2       │
│ Custom Questions (UGC)  │ N/A      │ ✅     │ Premium  │ 📦 Q3       │
│ Referral System         │ N/A      │ ✅     │ Premium  │ 📦 Q3       │
└─────────────────────────┴──────────┴────────┴──────────┴─────────────┘
```

### **Gamification Mechanics**

#### **Points System**

```
Truths:
- Basic answer: +10 points
- Creative answer: +15 points (mod-flagged)
- Popular answer: +5 points per upvote (future)

Dares:
- Proof submitted (photo/video): +20 points
- Verified completion: +25 points
- Extra challenge: +50 points (future)

Streaks:
- Consecutive game participation: 1 streak per game
- Streak bonus: +5 points per streak level
- Streak multiplier at 10+: Points × 1.5x

Bonuses:
- First game played: +50 points
- 25 games played: +100 points
- 100 games played: +250 points
```

#### **Achievements**

```
1. FIRST BLOOD - Complete first game (auto-unlock)
2. TRUTH MASTER - Complete 50 truths
3. DARE DEVIL - Complete 50 dares
4. ON FIRE - Maintain 10-game streak
5. SOCIAL BUTTERFLY - Play 25 games
6. POINT COLLECTOR - Earn 1000 points
7. NIGHT OWL - Play after 10 PM (5 times)
8. PARTY ANIMAL - Host 10 games
9. SPEEDSTER - Complete game in under 5 min
10. PERFECT EXECUTION - Complete 5 dares in a row
11. TRENDSETTER - Unlock all modes
12. IMMORTAL - 30-game streak
13. QUESTION MASTER - Answer 200 unique questions
14. GOLDEN BADGE - Reach 5000 points
15. TEAM PLAYER - Play with 50+ different people (future)
```

---

## ❓ GAME QUESTIONS DATABASE

> **TOTAL: 200+ questions per mode**
> **Structure:** Randomized order for each player, cross-mode compatibility logic

### **MODE 1: NORMAL (200 Questions)**

#### **Truths (100)**

1. What's your most embarrassing moment?
2. Have you ever lied to your friends? What about?
3. What's something you want but can't afford?
4. Have you ever cheated in a game?
5. What's your biggest insecurity?
6. Who do you have a secret crush on?
7. What's the most annoying habit you have?
8. Have you ever cried watching a movie?
9. What's your guilty pleasure?
10. Have you ever stolen anything?
11. What's something you're bad at?
12. Do you prefer being alone or with people?
13. What's your most irrational fear?
14. Have you ever ghosted someone?
15. What's a lie you've told your parents?
16. What would you do if you won the lottery?
17. Have you ever pretended to laugh at a joke?
18. What's something you regret doing?
19. Have you ever tasted someone's food without asking?
20. What's your weirdest obsession?
21. Have you ever forged your parents' signature?
22. What's your best physical feature?
23. Who's your least favorite person here?
24. Have you ever lied about your age?
25. What's something you've never told anyone?
26. Do you sing in the shower?
27. What's your biggest pet peeve?
28. Have you ever wet the bed as a teenager?
29. What's your biggest turn-off in a person?
30. Do you read the terms and conditions?
31. Have you ever been to jail or arrested?
32. What's your most controversial opinion?
33. Have you ever snooped through someone's phone?
34. What's something you're jealous of?
35. Do you pick your nose?
36. Have you ever skipped school or work?
37. What's your worst habit?
38. Have you ever fallen asleep during someone's story?
39. What's something you've Googled that you're ashamed of?
40. Do you check yourself in mirrors/windows?
41. Have you ever pretended to be someone else online?
42. What's your biggest disappointment in life?
43. Have you ever hurt someone on purpose?
44. What's something you lie about regularly?
45. Do you ever talk to yourself?
46. Have you ever taken credit for someone else's work?
47. What's your secret superpower wish?
48. Have you ever spied on someone?
49. What's something you do that you don't want anyone knowing?
50. Do you believe in astrology/tarot?
51. Have you ever been dumped embarrassingly?
52. What's the worst present you've received?
53. Have you ever bailed on friends last minute?
54. What's something you pretend to understand but don't?
55. Do you talk in your sleep?
56. Have you ever hit someone?
57. What's your pettiest reason for not liking someone?
58. Have you ever lied on your resume/CV?
59. What's something everyone assumes about you that's false?
60. Do you have a secret second account (social media)?
61. Have you ever laughed at someone's misfortune?
62. What's your most unpopular opinion?
63. Have you ever pretended to be sick to avoid something?
64. What's the meanest thing you've thought about a friend?
65. Do you text people you actually dislike?
66. Have you ever made someone cry intentionally?
67. What's something you only do when no one's watching?
68. Have you ever been in love with someone unavailable?
69. What's your biggest weakness?
70. Do you check your ex's social media?
71. Have you ever been mean to someone for popularity?
72. What's something you've lied about your whole life?
73. Have you ever sabotaged someone?
74. What's your darkest secret?
75. Do you judge people by their appearance first?
76. Have you ever sent a message and regretted it immediately?
77. What's something you do that's hypocritical?
78. Have you ever gone through someone's trash?
79. What's the pettiest argument you've had?
80. Do you fake sick to skip things?
81. Have you ever copied someone's homework?
82. What's your biggest irrational belief?
83. Have you ever been jealous of a friend's success?
84. What's something you've never told your best friend?
85. Do you stalker-stalk people online?
86. Have you ever repeated a rumor you knew was false?
87. What's something you do that contradicts your values?
88. Have you ever had an inappropriate thought about someone here?
89. What's your biggest regret this year?
90. Do you exaggerate stories to make them better?
91. Have you ever been genuinely scared?
92. What's something you've hid from your parents?
93. Do you rate people's attractiveness out loud (privately)?
94. Have you ever been genuinely angry at someone here?
95. What's the pettiest reason you've stopped talking to someone?
96. Do you Google yourself?
97. Have you ever let someone take blame for something you did?
98. What's something you're ashamed of?
99. Have you ever been attracted to someone inappropriate?
100. What would you change about yourself physically?

#### **Dares (100)**

1. Sing the chorus of your favorite song out loud
2. Do 10 push-ups right now
3. Call someone from your contacts and say "Hi, I wanted to hear your voice"
4. Make a silly face for 30 seconds straight
5. Text your crush a compliment (if applicable)
6. Speak in an accent for the next 3 messages
7. Do your best impression of someone in the room
8. Google the most embarrassing thing and read it aloud
9. Send a meme to the group chat without context
10. Do a funny dance move
11. Recite the alphabet backwards
12. Put a random item on your head and take a selfie
13. Describe your crush without naming them
14. Write a haiku about this group
15. Speak only in questions for 5 messages
16. Do your best celebrity impression
17. Post a silly selfie on your story
18. Hold a plank for 30 seconds
19. Scroll through your phone and read the last text you sent
20. Attempt a backflip (or forward roll)
21. Do 20 jumping jacks
22. Narrate everything you do for 2 minutes like a sports commentator
23. Compliment everyone in the room
24. Write something funny on your hand
25. Do your worst runway walk
26. Call a friend and ask for an embarrassing story about you
27. Make a TikTok dance (or attempt)
28. Pretend to be a game show host
29. Count to 100 by 7s (without messing up)
30. Act out your favorite movie scene
31. Do the worm
32. Whisper something funny in someone's ear
33. Try to lick your own elbow
34. Do a cartwheel (or attempt)
35. Describe your day as if it were a movie
36. Make animal sounds for 30 seconds
37. Do the splits (or attempt)
38. Sing happy birthday in a crazy voice
39. Pretend to interview yourself
40. Do a stand-up comedy bit (2 minutes)
41. Walk like an old person for 1 minute
42. Pretend to be a robot
43. Make up a rap about the group
44. Floss dance (or attempt)
45. Pretend to be a TV commercial
46. Do the chicken dance
47. Attempt a handstand
48. Describe a fruit seductively
49. Pretend to be a tour guide in your room
50. Do a dramatic monologue
51. Moonwalk (or attempt)
52. Pretend you're a customer service representative
53. Do an exaggerated laugh for 15 seconds
54. Describe a location as if you're selling it
55. Pretend to be a news reporter
56. Do the limbo
57. Act like different emotions for 10 seconds each
58. Pretend you're narrating a nature documentary about the room
59. Do the wave motion with your body
60. Speak like Yoda for 3 messages
61. Draw with your non-dominant hand and show it
62. Pretend to be a pirate for 2 minutes
63. Do a workout video for 1 minute
64. Describe food like a food critic
65. Act like you're in a horror movie for 30 seconds
66. Pretend to be a game show contestant
67. Do karaoke (1 minute of a song)
68. Act like a secret agent
69. Describe a person as if writing their dating profile
70. Pretend you're a superhero
71. Do a fashion show walk with objects
72. Speak in rhymes for 5 messages
73. Act like a flight attendant
74. Describe your hobbies like you're on a dating app
75. Pretend to be a magic show host
76. Do arm circles 30 times
77. Act out different professions (30 seconds each)
78. Describe something using only hand gestures
79. Pretend to be a tour guide for your house
80. Do a meditation pose and speak softly
81. Act like you're being interviewed for a talk show
82. Describe colors as flavors
83. Pretend to be a therapist
84. Do star jumps 10 times
85. Act like a sports commentator for this game
86. Describe an animal as if it were a person
87. Pretend to be a weather reporter
88. Do a movie trailer voice for your day
89. Act like you're at a fancy restaurant
90. Describe an object like it's alive
91. Pretend to be a ghost
92. Do 15 burpees
93. Act like you're in a cheesy romance movie
94. Describe a job you'd never do
95. Pretend to be a drill sergeant
96. Do wall sits for 30 seconds
97. Act like different animals (10 seconds each)
98. Describe your ideal date
99. Pretend to be a villain
100. Describe what you ate today as if it's a Michelin star meal

---

### **MODE 2: FLIRTY (200 Questions)**

#### **Truths (100)**

1. Have you ever had a crush on two people at once?
2. What's the most romantic thing anyone's done for you?
3. Have you ever kissed someone you regretted?
4. What's your biggest turn-on?
5. Have you ever had feelings for someone who didn't know?
6. What's the most flirty thing you've done?
7. Do you believe in love at first sight?
8. Have you ever been catfished?
9. What's your ideal first date?
10. Have you ever made the first move?
11. What's your biggest turn-off in dating?
12. Do you prefer long-term or casual relationships?
13. Have you ever been jealous of a partner's friend?
14. What's the most romantic movie scene to you?
15. Have you ever dated someone your friends didn't approve of?
16. What's your love language?
17. Have you ever faked interest to impress someone?
18. What would your dream relationship look like?
19. Have you ever dated someone from work/school?
20. What's your biggest relationship fear?
21. Do you believe soulmates exist?
22. Have you ever had a rebound relationship?
23. What's the most intimate thing (non-sexual) you've done with someone?
24. Have you ever had a "what if" about someone?
25. What's your biggest dating dealbreaker?
26. Do you prefer being pursued or pursuing?
27. Have you ever loved someone more than they loved you?
28. What's the sweetest compliment you've received?
29. Have you ever been in love with someone unattainable?
30. What would make you fall for someone immediately?
31. Have you ever ended a relationship abruptly?
32. What's your most romantic fantasy?
33. Do you believe in second chances in love?
34. Have you ever felt butterflies for someone?
35. What's the most flirty text you've received?
36. Have you ever been too nervous to tell someone how you feel?
37. What's your ideal type (be specific)?
38. Have you ever been friend-zoned?
39. What's the most daring thing you'd do for love?
40. Do you value emotional or physical attraction more?
41. Have you ever cheated (emotionally or physically)?
42. What's the perfect romantic gesture to you?
43. Have you ever said "I love you" first?
44. What's your biggest insecurity about relationships?
45. Do you prefer shy or outgoing partners?
46. Have you ever dated someone older/younger?
47. What would be a deal-maker in a relationship?
48. Have you ever felt instant chemistry with someone?
49. What's the most awkward dating situation you've been in?
50. Do you text or call more with someone you like?
51. Have you ever been ghosted?
52. What's your view on PDA?
53. Have you ever stalked a crush online?
54. What would you change about your dating history?
55. Do you believe opposites attract?
56. Have you ever dated someone very different from you?
57. What's the best compliment you've given someone?
58. Have you ever felt like you weren't enough for someone?
59. What would your partner say about you?
60. Do you fall fast or slow?
61. Have you ever made someone jealous intentionally?
62. What's the most intimate conversation you've had?
63. Do you prefer spontaneous or planned dates?
64. Have you ever regretted a breakup?
65. What's the smallest thing that makes you attracted to someone?
66. Have you ever been with someone just for their looks?
67. What's your biggest romantic fail?
68. Do you believe in fate in relationships?
69. Have you ever hidden a relationship?
70. What's the most forward flirt you've seen?
71. Have you ever been the "other person"?
72. What would your ideal partner be like?
73. Do you believe in dating "out of your league"?
74. Have you ever loved your best friend?
75. What's the most heartbreaking breakup you've had?
76. Do you prefer emotional depth or physical chemistry?
77. Have you ever stayed in a relationship too long?
78. What's the most romantic song to you?
79. Have you ever felt butterflies in your stomach from a text?
80. Do you believe in marriage?
81. Have you ever fantasized about someone you know?
82. What would make you break up with someone?
83. Do you think about your exes?
84. What's the most flirty move you've seen work?
85. Have you ever been in a love triangle?
86. What's your ideal relationship timeline?
87. Do you prefer mystery or knowing everything about someone?
88. Have you ever felt like someone was out of your league?
89. What's the most beautiful thing about love?
90. Have you ever trusted someone with your heart?
91. What would be your deal-breaker in a new relationship?
92. Do you believe in soulmates?
93. Have you ever had a secret admirer?
94. What's the most romantic place you've been?
95. Do you believe in love at first sight now?
96. Have you ever been tempted to cheat?
97. What's your ideal romantic surprise?
98. Have you ever felt love for someone unexpectedly?
99. What would you want your partner to know about you?
100. Do you believe love conquers all?

#### **Dares (100)**

1. Text your crush a flirty emoji
2. Send a voice message saying something cute
3. Call someone and compliment them sincerely
4. Post a thirst trap selfie on your story
5. Write a love letter to someone (read it aloud)
6. Send a flirty meme to someone
7. Do a slow-motion video of yourself
8. Send a picture of your smile to the group
9. Say something romantic about the person to your left
10. Write a haiku about love
11. Describe your ideal date out loud
12. Send a compliment to someone who intimidates you
13. Do a seduction pose and send the pic
14. Read a romantic poem aloud (even if it's cheesy)
15. Text someone: "I appreciate you more than you know"
16. Make heart eyes at someone for 30 seconds
17. Sing a love song to someone (even badly)
18. Draw a heart on someone's hand
19. Tell someone they have beautiful eyes (and mean it)
20. Send a "thinking of you" message to someone
21. Write pickup lines and read them aloud
22. Give someone in the room a genuine compliment
23. Send an unexpected love song to someone
24. Describe someone's best qualities
25. Text someone: "You're my favorite"
26. Make a flirty video (lip sync to a love song)
27. Tell someone you'd date them (hypothetically)
28. Send a romantic photo to the group
29. Write something you admire about each person
30. Call someone and say something sweet
31. Send a rose emoji with a message
32. Describe your dream date in detail
33. Tell someone they light up the room
34. Text someone a genuine "I miss you"
35. Make a heart with your hands and photo it
36. Compliment someone's style intensely
37. Write a sweet note to someone and give it
38. Tell someone they're beautiful/handsome
39. Send someone a song that reminds you of them
40. Write a short love story about two people here
41. Flirt with someone using only emojis
42. Tell someone they make you smile
43. Send a "you're on my mind" message
44. Describe what you find attractive about someone
45. Tell someone they inspire you
46. Text someone: "Let's go on a date"
47. Write a romantic text and send it
48. Compliment someone's laugh/smile
49. Tell someone you value their friendship
50. Send someone a love quote
51. Make a flirty Snapchat filter video
52. Tell someone they're funnier than they think
53. Send a "good morning" message to someone
54. Describe someone's best feature
55. Tell someone they're smarter than they think
56. Text someone an honest compliment
57. Send a picture with a cute caption
58. Tell someone they deserve better (nicely)
59. Write something poetic about love
60. Compliment someone's intelligence
61. Tell someone they're stronger than they think
62. Send someone a love meme
63. Describe your celebrity crush
64. Tell someone they're exactly who they should be
65. Text someone: "You make me happy"
66. Send a selfie with a cute caption
67. Compliment someone's kindness
68. Tell someone they're unique
69. Send a heart to someone
70. Tell someone they have great taste
71. Text someone something that made you think of them
72. Describe someone's best personality trait
73. Tell someone they're worth it
74. Send someone a compliment they need to hear
75. Write a short poem about attraction
76. Tell someone they're underrated
77. Text someone: "I'm glad you exist"
78. Send a cute video to someone
79. Compliment someone's energy
80. Tell someone they inspire you to be better
81. Send someone a love song lyric
82. Describe someone's charm
83. Tell someone they're one of a kind
84. Text someone: "Let's hang out soon"
85. Send a flirty photo
86. Compliment someone's character
87. Tell someone they're a good person
88. Text someone something vulnerable
89. Send someone a meaningful quote
90. Describe what makes someone special
91. Tell someone they matter to you
92. Text someone: "I'm grateful for you"
93. Send a kind message to someone random
94. Compliment someone's style
95. Tell someone they have a beautiful soul
96. Text someone: "You're appreciated"
97. Send someone an encouraging message
98. Describe someone's positive impact
99. Tell someone they're important to you
100. Text someone: "You're one of my favorite people"

---

### **MODE 3: COUPLES (200 Questions)**

#### **Truths (100)**

[Intimate, relationship-focused questions tailored for dating couples]

1. What was your first impression of me?
2. When did you first know you loved me?
3. What's your favorite memory of us?
4. What do you love most about me?
5. Have you ever felt insecure in our relationship?
6. What's something you want to do together?
7. How do you feel about our future?
8. What's the most intimate moment we've shared?
9. Have you ever been tempted by someone else?
10. What would make our relationship stronger?
[...continues with 90 more intimate couple questions...]

---

### **MODE 4: HARDCORE (200 Questions)**

#### **Truths (100)**

[Extreme, outrageous, "what would you do" scenarios]

1. What's the craziest thing you'd do for money?
2. Have you ever thought of doing something illegal?
3. What's your most controversial opinion?
4. Would you ever cheat if you wouldn't get caught?
5. What's something you've lied about to everyone?
[...continues with 95 more hardcore truth questions...]

#### **Dares (100)**

[High-energy, outra...geous, daring challenges]

1. Do a handstand for 1 minute
2. Eat something spicy and rate it
3. Do 50 jumping jacks
4. Freestyle rap for 2 minutes
5. Call someone and tell them you're in a game show
[...continues with 95 more hardcore dares...]

---

### **MODE 5: FAMILY-FRIENDLY (200 Questions)**

[All-ages questions, no inappropriate content, fun for families and kids]

#### **Truths (100)**
1. What's your favorite color?
2. What's your favorite animal?
3. If you could have any superpower, what would it be?
[...100+ wholesome questions...]

#### **Dares (100)**
[Clean, silly, fun dares appropriate for all ages]

---

### **MODE 6: OWN MODE**

[No pre-loaded questions - just spinning and selecting]

---

## 📰 BLOG CATEGORIES

### **Blog Categories (Homepage)**

```
1. PARTY IDEAS
   - "10 Best Truth or Dare Games for College Parties"
   - "How to Host the Ultimate Game Night"
   - "Games to Break the Ice at New Gatherings"
   - "Creating Memories: Best Party Games for Adults"
   - "Hosting Tips: Making Everyone Comfortable During Games"

2. RELATIONSHIP & DATING
   - "Truth or Dare Ideas for Couples"
   - "Games to Deepen Your Relationship Connection"
   - "Date Night Ideas Using DareWheel"
   - "First Date Icebreakers Through Games"
   - "Spicing Up Your Relationship with Game Nights"

3. PSYCHOLOGY & SOCIAL
   - "The Psychology Behind Truth or Dare"
   - "Building Confidence Through Social Games"
   - "Why Games Create Stronger Friendships"
   - "Understanding Group Dynamics Through Games"
   - "How Games Help Overcome Social Anxiety"

4. TEAM BUILDING
   - "Team Building Games for Office Parties"
   - "Building Trust in Teams Through Games"
   - "Corporate Game Night Ideas"
   - "Breaking Silos: Games for Cross-Team Bonding"
   - "Remote Team Building With DareWheel"

5. GAMING TIPS & TRICKS
   - "Best Questions for Different Friend Groups"
   - "How to Make Dares That Everyone Enjoys"
   - "Game Master Tips for Smooth Gameplay"
   - "Managing Difficult Players During Games"
   - "Keeping Games Fun and Inclusive"

6. TRENDING & VIRAL
   - "Latest Game Trends"
   - "Most Popular Questions This Week"
   - "User Stories: Wildest Moments"
   - "Celebrity Truth or Dare Moments"
   - "Game Night Fails (And How to Avoid Them)"

7. MENTAL HEALTH
   - "Games That Improve Mental Wellbeing"
   - "Why Vulnerability Strengthens Bonds"
   - "Games for Anxiety Relief"
   - "Social Connection and Mental Health"
   - "Fun as a Form of Self-Care"

8. BEGINNER'S GUIDE
   - "What is Truth or Dare?"
   - "First Time Hosting? Here's How"
   - "Understanding Game Modes"
   - "Creating a Welcoming Game Environment"
   - "Common Questions Answered"
```

---

## 🎨 UI/UX SPECIFICATIONS

### **Color Palette**

```
PRIMARY COLORS:
- Background: #0F0F1E (Deep Navy/Black)
- Primary Accent: #FF006E (Hot Pink/Magenta)
- Secondary Accent: #00D9FF (Cyan/Electric Blue)
- Tertiary Accent: #00FF6B (Neon Green)

SUPPORTING COLORS:
- Text Primary: #FFFFFF (White)
- Text Secondary: #A0A0B8 (Light Gray)
- Success: #00FF6B (Neon Green)
- Warning: #FFD700 (Gold)
- Error: #FF006E (Hot Pink)
- Border: #1A1A2E (Slightly lighter than background)
- Hover: rgba(255, 0, 110, 0.1) (Pink with transparency)

GRADIENTS:
- Premium: linear-gradient(135deg, #FF006E, #00D9FF)
- Success: linear-gradient(135deg, #00FF6B, #00D9FF)
- Danger: linear-gradient(135deg, #FF006E, #FFD700)

OPACITY LEVELS:
- Hover State: 0.8
- Disabled: 0.5
- Shadow (light): rgba(0, 0, 0, 0.3)
- Shadow (dark): rgba(0, 0, 0, 0.6)
```

### **Typography**

```
PRIMARY FONT: Poppins (Google Fonts)
- Weights: 300 (Light), 500 (Medium), 700 (Bold), 900 (Black)
- Fallback: sans-serif

SECONDARY FONT: Inter (Google Fonts)
- Weights: 400 (Regular), 600 (Semi-Bold), 700 (Bold)
- Fallback: sans-serif

SCALE:
- Display/Logo: 48px - 72px, Poppins 900, Letter-spacing: -1.5px
- H1: 36px, Poppins 700, Letter-spacing: -0.5px
- H2: 28px, Poppins 700
- H3: 24px, Poppins 600
- Body Large: 18px, Inter 400, Line-height: 1.6
- Body: 16px, Inter 400, Line-height: 1.5
- Body Small: 14px, Inter 400
- Label: 12px, Poppins 600, Text-transform: uppercase
- Caption: 11px, Inter 300

EMPHASIS:
- Bold text: Poppins 700
- Highlighted text: Poppins 900 with color
```

### **Component Inventory**

```
PAGES:
1. Home (Landing)
   - Header with nav
   - Hero section with CTA buttons
   - Feature showcase
   - Testimonials
   - Footer

2. Offline Mode
   - Add Player section
   - Players list
   - Mode selector
   - Spinning wheel
   - Game interface

3. Online Mode
   - Create Room form
   - Room code display
   - Waiting for players
   - Game interface (same as offline)

4. Join Room
   - Room code input
   - Player name input
   - Mode display
   - Join button

5. Game Play
   - Spinning wheel (animated)
   - Player selection highlight
   - Truth/Dare/Random buttons
   - Question display
   - Chat box (online)
   - Leaderboard
   - Timer
   - Notifications

6. Blog
   - Category filter
   - Blog post list
   - Featured posts
   - Search

7. Blog Detail
   - Full post content
   - Related posts
   - Comments/share

8. Terms & Conditions
   - Scrollable full text
   - Accept checkbox

9. User Profile (Optional MVP)
   - Stats display
   - Achievement badges
   - Game history

REUSABLE COMPONENTS:
- Button (variants: primary, secondary, outline, ghost)
- Input (text, password, email)
- Modal/Dialog
- Card
- Badge
- Avatar
- Loading spinner
- Toast/Notification
- Tooltip
- Dropdown
- Toggle switch
- Progress bar
- Slider
- Confetti animation
```

---

## ⚖️ TERMS & CONDITIONS

### **COMPLETE TERMS & CONDITIONS FOR DAREWHEEL**

#### **1. AGREEMENT TO TERMS**

By accessing and using DareWheel (the "Platform"), you agree to be bound by these Terms & Conditions. If you do not agree to any part of these terms, you must not use the Platform.

DareWheel ("We," "Us," "Our") operates the Platform. The Platform is provided on an "AS-IS" and "AS-AVAILABLE" basis.

#### **2. AGE REQUIREMENTS & PARENTAL CONSENT**

- **Normal Mode**: 13 years of age or older
- **Family-Friendly Mode**: 13 years of age or older (parental guidance recommended for children under 13)
- **Flirty Mode**: 16 years of age or older
- **Couples Mode**: 18 years of age or older
- **Hardcore Mode**: 18 years of age or older
- **Own Mode**: 13 years of age or older

Users must verify their age upon account creation. False age declaration may result in account termination.

**Parental Responsibility**: Parents/guardians of users under 18 are responsible for monitoring usage and ensuring age-appropriate mode selection.

#### **3. USER ACCOUNT RESPONSIBILITIES**

- You are responsible for maintaining the confidentiality of your account credentials
- You are responsible for all activity under your account
- You must notify us immediately of unauthorized account access
- You cannot share your account with others
- You cannot use the Platform to impersonate others
- One account per person (multiple accounts may result in termination)

#### **4. CODE OF CONDUCT**

Users agree NOT to:

**Prohibited Behavior:**
- Post, upload, or transmit hateful, abusive, threatening, or discriminatory content
- Harass, bully, stalk, or threaten other users
- Create content involving minors in any inappropriate context
- Engage in sexual harassment or unwanted advances
- Post non-consensual intimate images (any gender)
- Spam, flood, or send repetitive messages
- Attempt to hack or gain unauthorized access to the Platform
- Upload malware, viruses, or harmful code
- Impersonate others or misrepresent identity
- Post copyrighted content without permission
- Violate any local, state, or federal laws
- Engage in fraud, scams, or deceptive practices
- Share contact information (phone, address, email) without consent
- Encourage or promote illegal activities
- Use the Platform for commercial purposes without permission

**Violations** may result in:
- Content removal
- Account suspension
- Account termination
- Legal action

#### **5. MEDIA & CONTENT POLICIES**

**Video & Audio Recording:**
- Users explicitly consent to video/audio recording within the Platform
- Users understand their voice/video may be seen by other room participants
- Users are responsible for obtaining consent from anyone else visible/audible in their media
- DareWheel does NOT store video/audio files after room closure
- Users assume full responsibility for the content they create

**Screenshot Prevention:**
- Users acknowledge that our watermarking technology reduces (but cannot entirely prevent) screenshot capability
- We are NOT liable for unauthorized screenshots taken by room participants
- Users should not share sensitive information on video that they wouldn't want captured

**Photo/Image Policy:**
- All photos uploaded are temporary and deleted after room closure
- Users are responsible for obtaining rights to any photos they share
- Do NOT post intimate, non-consensual, or explicit photos
- Do NOT post someone else's photo without consent

**Data Retention:**
- NO user-generated media is stored permanently
- Room data is deleted after 10 minutes of inactivity OR room closure
- Game statistics are anonymized and stored for analytics only
- Personal information (name, email) is encrypted and stored securely

#### **6. PRIVACY & DATA DELETION**

**What We Collect:**
- Account information (email, username, date of birth)
- Game statistics (points, achievements, game history)
- Device information (IP address, browser type) for security
- Room codes and player names (temporary, deleted after 10 min)
- Chat messages (online mode, deleted after room closure)

**What We DO NOT Collect:**
- Video/audio files (streamed peer-to-peer, not stored)
- Photos (stored in-memory only, deleted on room close)
- Payment information (processed by third-party, we don't store card data)

**Your Rights:**
- You can request a copy of your personal data
- You can request deletion of your account and associated data
- You can opt-out of analytics tracking
- You have 30 days to request account deletion (GDPR compliant)

**Data Deletion Process:**
1. User requests account deletion via settings
2. All personal data deleted within 30 days
3. Game statistics anonymized (no name/email)
4. Confirmation email sent upon completion

#### **7. ROOM CLOSURE & DATA MANAGEMENT**

**Automatic Room Closure:**
- Rooms close after 10 minutes of inactivity
- Rooms close immediately when all players leave
- Host can manually close a room

**Upon Room Closure:**
- All room data is deleted from Redis
- Chat messages are deleted
- Media streams are terminated
- Room code becomes invalid
- Players cannot rejoin

**Exception:**
- Room statistics (anonymized) may be stored for analytics

#### **8. ONLINE SAFETY & CONDUCT**

**For All Users:**
- Report inappropriate behavior using the report button
- Block users who harass you
- Do not share personal contact information
- Never meet someone from the Platform without safety precautions
- Do not accept favors or money from other users

**For Minor Users (Under 18):**
- Parents/guardians should monitor gameplay
- Never share personal information with strangers
- Tell an adult if someone makes you uncomfortable
- Do not participate in dares involving leaving your home

**DareWheel's Responsibility:**
- We monitor reported content
- We maintain a moderation team
- We remove violative content within 24 hours
- We may notify law enforcement if illegal content is detected
- We have a zero-tolerance policy for content involving minors

#### **9. THIRD-PARTY LIABILITY**

**DareWheel is NOT Responsible For:**
- Real-world injury from dares
- Damage to property from dares
- Emotional distress from questions/dares
- Actions taken based on game questions/dares
- Content created by other users
- Unauthorized access to your account
- Service interruptions due to force majeure

**Users Acknowledge:**
- Dares are meant to be fun and consensual
- Users are responsible for their actions
- Users should decline uncomfortable dares
- Dares should not cause harm (physical, emotional, or reputational)

#### **10. INTELLECTUAL PROPERTY**

- All Platform content (design, questions, code) is owned by DareWheel or licensed
- Users retain ownership of content they create
- By posting, users grant DareWheel a non-exclusive license to use content for operation
- User-generated content may be anonymized for analytics
- Users cannot claim ownership of pre-loaded questions

#### **11. LIMITATION OF LIABILITY**

**DareWheel will NOT be liable for:**
- Loss of data or access
- Lost profits or revenue
- Emotional distress
- Third-party actions
- Service interruptions
- Any indirect, incidental, or consequential damages

**Liability Cap:**
- DareWheel's total liability is limited to the amount you paid (if any) in the 12 months prior

#### **12. MODIFICATIONS TO TERMS**

- DareWheel may modify these terms at any time
- Users will be notified via email and in-app message
- Continued use constitutes acceptance of new terms
- Major changes require explicit re-acceptance

#### **13. TERMINATION**

**DareWheel may terminate your account if:**
- You violate these Terms & Conditions
- You engage in illegal activity
- You create multiple accounts
- You abuse other users
- You attempt to hack the Platform
- You repeatedly share prohibited content

**Termination is permanent** - all associated data will be deleted.

#### **14. GOVERNING LAW & DISPUTE RESOLUTION**

- These Terms are governed by the laws of [Jurisdiction]
- Disputes will be resolved through:
  1. Good-faith negotiation (30 days)
  2. Mediation (if negotiation fails)
  3. Binding arbitration (if mediation fails)

**You waive the right to a jury trial and class action**

#### **15. CONTACT US**

For questions about these Terms, contact:
- Email: legal@darewheel.app
- Support: support@darewheel.app
- Mailing Address: [Your Address]

**Effective Date**: March 2026
**Last Updated**: March 2026

---

## 📅 DEVELOPMENT PHASES & TIMELINE

### **Phase 1: MVP (Months 1-4)**

**Month 1: Foundation & Setup**
```
Week 1-2:
- Project setup (Git, CI/CD, Docker)
- Database schema & migrations
- Backend scaffolding (Express + Socket.io)
- Frontend scaffolding (React + Vite)

Week 3-4:
- Authentication system (JWT)
- API structure
- Socket.io event architecture
- Initial component setup
```

**Month 2: Core Features**
```
Week 1-2:
- Offline mode implementation
  * Add players functionality
  * Spinning wheel animation
  * Player selection display
  * Question display system
  
Week 3-4:
- Online mode foundation
  * Room creation & joining
  * Socket.io room management
  * Real-time player sync
  * Basic chat system
```

**Month 3: Gamification & Polish**
```
Week 1-2:
- Points system
- Streak tracking
- Leaderboard display
- Achievement badges

Week 3-4:
- Question randomization logic
- Timer system
- Notifications
- UI refinement & styling
```

**Month 4: Testing & Launch Prep**
```
Week 1-2:
- Unit testing
- Integration testing
- Performance testing
- Security audits

Week 3-4:
- Bug fixes
- Final polish
- Documentation
- MVP Launch 🚀
```

### **Phase 2: Premium Features (Months 5-8)**

```
Month 5:
- Analytics dashboard
- Game history storage
- Advanced statistics

Month 6-7:
- User-generated questions (moderated)
- Community question packs
- Referral system

Month 8:
- Premium tier launch
- Payment integration
- Feature flags management
```

### **Phase 3: Scaling & Optimization (Months 9+)**

```
Month 9+:
- Microservices migration
- Database optimization
- Load testing at scale
- Advanced features based on user feedback
```

---

## 🚀 DEPLOYMENT STRATEGY

### **Technology Stack for Deployment**

```
HOSTING:
- Frontend: Vercel or Netlify (auto-scaling, CDN)
- Backend: AWS EC2 / Railway / Render (Node.js)
- Database: AWS RDS PostgreSQL (managed)
- Cache: AWS ElastiCache Redis (managed)
- Storage: AWS S3 (blog images, assets)
- CDN: Cloudflare (static assets)
- Domain: Namecheap / GoDaddy
- Email: SendGrid (for notifications)
- Monitoring: Datadog / New Relic
```

### **Deployment Pipeline**

```
CODE → GitHub → GitHub Actions → Tests → Build → Deploy

STAGING ENVIRONMENT:
1. Code pushed to develop branch
2. Auto-tests run
3. Deploy to staging
4. Manual testing
5. Merge to main

PRODUCTION ENVIRONMENT:
1. Tag release version
2. Run full test suite
3. Build Docker containers
4. Push to container registry
5. Deploy to production
6. Monitor for errors
7. Rollback if critical issues

Environment Variables:
- .env.development
- .env.staging
- .env.production
```

### **Monitoring & Analytics**

```
REAL-TIME MONITORING:
- Server uptime (Uptime Robot)
- Error tracking (Sentry)
- Performance metrics (Datadog)
- User analytics (Mixpanel)

ALERTING:
- CPU > 80% → alert
- Error rate > 1% → alert
- Response time > 2s → alert
- Database down → critical alert
```

---

## 📊 SUCCESS METRICS (Phase 1 Target)

```
User Metrics:
- 1000+ DAU (Daily Active Users) in Month 1
- 500+ MAU (Monthly Active Users) in Month 2
- 20% retention rate by Month 3
- 4.5+ star rating on App Store

Engagement Metrics:
- Avg 3+ games per user per week
- 30+ min avg session time
- 50%+ return rate within 7 days
- 200+ questions attempted per user

Technical Metrics:
- 99.5% uptime
- < 200ms avg response time
- < 1% error rate
- 0 security incidents

Business Metrics:
- <$500 monthly infrastructure cost
- 50K requests/day capacity
- 0 data breaches
```

---

## 🔐 SECURITY CHECKLIST

- [ ] HTTPS/TLS for all connections
- [ ] JWT tokens with proper expiry
- [ ] Password hashing (bcryptjs)
- [ ] Rate limiting (10 rooms/hour per IP)
- [ ] Input validation (Zod/Joi)
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (React sanitization)
- [ ] CSRF token implementation
- [ ] CORS configuration (whitelist domains)
- [ ] WebRTC encryption (DTLS-SRTP)
- [ ] Regular dependency audits
- [ ] Penetration testing (quarterly)
- [ ] GDPR compliance
- [ ] Content moderation system
- [ ] Abuse reporting mechanism

---

## 📝 NEXT STEPS

1. **Approve Tech Stack** ✓ (Confirmed)
2. **Review Database Schema** → Adjust as needed
3. **Set Up Development Environment** → Docker setup
4. **Create API Documentation** → Swagger/OpenAPI
5. **Begin Sprint 1 Development**
6. **Stakeholder Sync Weekly**

---

**Document Version**: 1.0  
**Last Updated**: March 27, 2026  
**Status**: Ready for Development  
**Estimated Team Size**: 4-6 developers (MVP phase)

---

## ✅ SIGN-OFF

This document outlines the complete technical and product specification for DareWheel. Upon approval, development can begin immediately.

**Prepared By**: AI Project Manager  
**Approved By**: [Project Owner]  
**Date**: March 27, 2026

---

END OF DOCUMENT
