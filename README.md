# BlindMatch 💜

> Personality-first dating platform. Connect through ideas, values, and interests — looks come later.

## Architecture

```
blindmatch/
├── backend/          # NestJS API (TypeScript)
│   ├── src/
│   │   ├── auth/         # JWT auth + Google OAuth
│   │   ├── users/        # User management
│   │   ├── profiles/     # Profile + matching algorithm
│   │   ├── matches/      # Likes, mutual matches, reveal stages
│   │   ├── chat/         # Messages + WebSocket gateway
│   │   ├── rooms/        # Interest rooms
│   │   ├── ai/           # Anthropic Claude integration
│   │   └── files/        # S3 photo/voice uploads
│   └── test/             # E2E tests
├── frontend/         # Flutter app (iOS + Android + Web)
│   └── lib/
│       ├── core/         # API client, Auth, Router, Theme
│       └── features/     # auth, profile, swipe, matches, chat, rooms
├── nginx/            # Reverse proxy + SSL
├── docker-compose.yml
├── docker-compose.dev.yml
└── Makefile
```

## Tech Stack

| Layer | Technology |
|---|---|
| Mobile | Flutter 3.x (iOS / Android / Web) |
| State | flutter_bloc (Cubit pattern) |
| Navigation | go_router |
| Backend | NestJS 10 (TypeScript) |
| Database | PostgreSQL 16 |
| Cache | Redis 7 |
| ORM | TypeORM |
| Auth | JWT + Refresh Tokens + Google OAuth |
| Real-time | Socket.IO (WebSocket) |
| AI | Anthropic Claude (Sonnet + Haiku) |
| Storage | AWS S3 |
| Proxy | Nginx |
| CI/CD | GitHub Actions |
| Container | Docker + Docker Compose |

## Core Features

### 🎭 Blind Matching (4-stage reveal)
- **Stage 1**: Anonymous profile — personality, tags, description, voice intro
- **Stage 2**: Age range + region (after mutual match)
- **Stage 3**: First name + main photo (mutual consent)
- **Stage 4**: Full profile reveal

### 🤖 AI Compatibility (Claude)
- Compatibility score with breakdown (interests / values / lifestyle / goals / personality)
- AI-generated icebreakers tailored to common interests
- Daily question of the day generation
- Content moderation via Claude Haiku

### 💬 Real-time Chat
- WebSocket via Socket.IO
- Typing indicators
- Read receipts
- Message reactions (emoji)
- Soft delete

### 🏠 Interest Rooms
- 10 default themed rooms (gaming, anime, music, travel, etc.)
- Members counter
- Topic-based filtering

## Quick Start

### Prerequisites
- Docker + Docker Compose
- Node.js 20+ (for local dev)
- Flutter 3.x (for mobile dev)

### 1. Clone and configure

```bash
git clone https://github.com/your-org/blindmatch.git
cd blindmatch
cp backend/.env.example backend/.env
# Edit backend/.env with your credentials
```

### 2. Generate SSL cert (dev)

```bash
make ssl-dev
```

### 3. Start all services

```bash
# Development (hot-reload)
make dev

# Production
make prod
```

### 4. Access

| Service | URL |
|---|---|
| API | http://localhost:3000 |
| Swagger | http://localhost:3000/api/docs |
| Adminer (dev) | http://localhost:8080 |

## Environment Variables

See `backend/.env.example` for all required variables.

Key variables:
- `JWT_SECRET` — change in production
- `JWT_REFRESH_SECRET` — change in production
- `ANTHROPIC_API_KEY` — get from console.anthropic.com
- `AWS_*` — S3 bucket for media uploads
- `GOOGLE_*` — Google OAuth credentials

## Running Tests

```bash
# Backend unit tests
make test

# Backend with coverage
make test-cov

# E2E tests
make test-e2e

# Flutter tests
make flutter-test
```

## API Overview

```
POST   /auth/register         Register with email
POST   /auth/login            Login → JWT
POST   /auth/refresh          Refresh access token
POST   /auth/logout           Logout
GET    /auth/google           Google OAuth

GET    /profiles/me           My profile
PATCH  /profiles/me           Update profile
GET    /profiles/candidates   Get swipe candidates
GET    /profiles/:id          Public profile (stage-filtered)

GET    /matches               My matches list
POST   /matches/:id/like      Like a profile
POST   /matches/:id/pass      Pass on a profile
POST   /matches/:id/reveal    Request reveal

GET    /chat/:matchId/messages    Message history
POST   /chat/:matchId/messages    Send message (REST)

GET    /rooms                  List interest rooms
POST   /rooms/:id/join         Join room
POST   /rooms/:id/leave        Leave room

GET    /ai/daily-question      Today's profile question
GET    /ai/icebreakers/:id     AI conversation starters

POST   /files/photo            Upload profile photo
POST   /files/voice            Upload voice intro
```

## WebSocket Events

Connect to `wss://api/chat` with `{ auth: { token } }`.

| Emit | Description |
|---|---|
| `join_match` | Join match room |
| `send_message` | Send a message |
| `typing` | Typing indicator |
| `read_messages` | Mark messages as read |
| `react` | Add emoji reaction |

| Listen | Description |
|---|---|
| `new_message` | Incoming message |
| `typing` | Partner typing status |
| `messages_read` | Read receipts |
| `reaction_added` | New reaction |

## Deployment

The GitHub Actions workflow (`.github/workflows/ci.yml`) automatically:
1. Runs all tests on every PR
2. Builds and pushes Docker image on merge to `main`
3. Deploys to production server via SSH

Required secrets: `DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_SSH_KEY`, `CODECOV_TOKEN`.

## Privacy & Safety

- No personally identifying info visible at stage 1 (no name, no photo, no exact age/location)
- Photos stored privately in S3, served only at stage 3+
- All messages content-moderated via AI
- Trust score system for reporting bad actors
- GDPR-compliant account deletion
