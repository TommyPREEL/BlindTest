# BlindTest

A real-time music blind test game. Players join a room, listen to Deezer track previews, and race to guess the song.

## Stack

- **Client** — React, Vite, Tailwind CSS, Socket.io-client
- **Server** — Node.js, Express, Socket.io, TypeScript
- **Shared** — Common types, events, and scoring logic (monorepo package)

## Prerequisites

- Node.js 20+
- Docker & Docker Compose (for production)

## Getting Started

```bash
# 1. Clone and install
npm install

# 2. Set up environment variables
cp .env.example .env
# Edit PORT and CLIENT_ORIGIN if needed

# 3. Start in development mode
npm run dev
```

| Service | URL                   |
|---------|-----------------------|
| Client  | http://localhost:5173 |
| Server  | http://localhost:3950 |

## Docker (Production)

```bash
docker compose up -d
```

| Service | Port |
|---------|------|
| Client  | 3900 |
| Server  | 3950 (internal, proxied via nginx) |

The client container (nginx) proxies `/socket.io/`, `/genres`, and `/health` to the server container.

## CI/CD

Push to `master` triggers a GitHub Actions workflow that:

1. Builds Docker images for client and server using the monorepo root as build context
2. Pushes them to GitHub Container Registry (`ghcr.io`)
3. Copies `docker-compose.yml` to the server via SCP
4. Deploys via SSH using `docker compose pull && docker compose up -d`

### Required GitHub Secrets

| Secret                  | Description                        |
|-------------------------|------------------------------------|
| `SSH_HOST`              | Server hostname or IP              |
| `SSH_USERNAME`          | SSH user                           |
| `SSH_PRIVATE_KEY`       | SSH private key                    |
| `SSH_PORT`              | SSH port (usually 22)              |
| `DEPLOY_PATH`           | Deployment path on the server      |

## Project Structure

```
packages/
  client/     React + Vite frontend
  server/     Express + Socket.io backend
  shared/     Shared types and scoring (compiled to dist/ before use)
```
