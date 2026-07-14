# Padlet-demo

Monorepo: **client** (React) + **server** (NestJS). Optional: **Docker** for mongo + server + client.

| Directory | Stack |
|-----------|-------|
| [`client/`](client/) | React, Vite, TypeScript |
| [`server/`](server/) | NestJS, Prisma, MongoDB |

## Quick start (local)

**Prerequisites:** Node.js 20+, npm, MongoDB (running as a single-node replica set — required for transactions, e.g. `mongod --replSet rs0` then `mongosh --eval "rs.initiate()"` once).

```bash
# Server
cd server
copy .env.example .env
npm install
npm run start:dev

# Client (second terminal)
cd client
copy .env.example .env
npm install
npm run dev
```

| App | URL |
|-----|-----|
| Client | http://localhost:5173 |
| API | http://localhost:3000/api |
| Health | http://localhost:3000/api/health |
| Swagger | http://localhost:3000/api/docs |

## Quick start (Docker)

**Prerequisites:** Docker Desktop.

```bash
copy .env.example .env
docker compose -f docker-compose up --build
```

| App | URL |
|-----|-----|
| Client | http://localhost:5173 |
| API | http://localhost:3001/api |
| Health | http://localhost:3001/api/health |
| Swagger | http://localhost:3001/api/docs |
| MongoDB (host) | `localhost:27018` |

For Docker, set in `client/.env`:

```env
VITE_API_URL=http://localhost:3001/api
```

## Project layout

```text
Padlet-demo/
├── client/           # Frontend — see client/README.md
├── server/           # Backend — see server/README.md
├── docker-compose    # mongo + server + client
└── .env              # MONGO_DB (Docker only)
```

## Where to add code

| Layer | Path |
|-------|------|
| UI | `client/src/components/` |
| Routes | `client/src/router.tsx` |
| API calls | `client/src/services/` |
| Client auth UI | `client/src/auth/` |
| Server features | `server/src/<feature>/` |
| Server authentication | `server/src/authentication/` (wire in `app.module.ts`) |
| DB schema | `server/prisma/schema.prisma` |
| DB in code | `PrismaService` in services |

## Run server + client together (important)

Pick **one** way — do not mix Docker and `npm` on the same ports.

| Mode | Command | Client `.env` |
|------|---------|---------------|
| **All local (npm)** | `server`: `npm run start:dev` + `client`: `npm run dev` | `VITE_API_URL=/api` (see `client/.env.example`) |
| **All Docker** | `docker compose -f docker-compose up --build` | set in compose (`3001`) — no change needed |
| **DB only Docker** | `docker compose up mongo` + npm for server/client | `VITE_API_URL=/api`, server `DATABASE_URL` → `mongodb://localhost:27018/padlet_db?replicaSet=rs0` |

**Common problems**

- **Port already in use** — stop the other stack (Docker or npm) before starting the second on 5173 / 3000 / 3001.
- **Client loads before server** — Docker now waits for `GET /api/health` on the server.
- **CORS / wrong API** — use `VITE_API_URL=/api` locally so Vite proxies to the server (port 3000).

## More detail

- [Client structure](client/README.md)
- [Server structure](server/README.md)
- [Testing guide](docs/TESTING.md)
