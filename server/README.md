# Server

NestJS REST API. MongoDB via **Prisma** (`prisma/`).

## Setup

```bash
cp .env.example .env
npm install
npm run start:dev
```

| URL | |
|-----|--|
| API | http://localhost:3000/api |
| Health | http://localhost:3000/api/health |
| Swagger | http://localhost:3000/api/docs |

**Docker:** API on host is http://localhost:3001/api (see root README).

Copy [`.env.example`](.env.example) to `.env`. Required: `DATABASE_URL`.

## Structure (`src/`)

```text
src/
├── main.ts                 # Bootstrap: CORS, ValidationPipe, Swagger, ExceptionsFilter
├── app.module.ts           # Root module: ConfigModule, PrismaModule, feature modules
├── prisma/
│   ├── prisma.service.ts   # PrismaClient + connect on startup
│   └── prisma.module.ts    # Global provider for PrismaService
├── health/                 # GET /api/health
└── common/
    └── filters/
        └── exception.filter.ts   # Global HTTP error handler
```

**Planned (not in repo yet):**

- `config.ts` — single file for env load + validation (instead of a `config/` folder)
- `authentication/` — your auth module; register it in `app.module.ts` when ready

## Environment

Variables are read from `server/.env` via `@nestjs/config` (see [`.env.example`](.env.example)).

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | MongoDB connection string (must include `?replicaSet=rs0` — transactions require a replica set) |
| `PORT` | API port (default `3000`) |
| `CORS_ORIGIN` | Allowed frontend origin (default `http://localhost:5173`) |
| `API_PREFIX` | Route prefix (default `api`) |
| `SWAGGER_ENABLED` | `true` / `false` |

## Data access

```text
Controller → Service → PrismaService → MongoDB
```

Inject `PrismaService` in feature services. No repository layer.

## Adding a feature

1. Create `src/<feature>/` with `*.module.ts`, controller, service, DTOs.
2. Import the module in [`app.module.ts`](src/app.module.ts).
3. Do not change `authentication/` unless you are working on that feature.
