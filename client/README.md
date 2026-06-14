# Client

React + Vite + TypeScript SPA.

## Setup

```bash
cp .env.example .env
npm install
npm run dev
```

http://localhost:5173

| Variable | Local (npm + npm) | Docker compose |
|----------|-------------------|----------------|
| `VITE_API_URL` | `/api` (via Vite proxy) | `http://localhost:3001/api` (set in compose) |
| `VITE_DEV_API_TARGET` | `http://127.0.0.1:3000` | not used |

Using `/api` avoids CORS: the browser talks only to Vite (`5173`), and Vite forwards to the server.

## Structure (`src/`)

```text
src/
├── assets/           # Images, icons (imported in code)
├── auth/             # Sign-in / sign-out UI and helpers
├── components/       # Reusable UI (buttons, cards, …)
├── enums/            # Shared enumerations
├── interfaces/       # TypeScript types (API models, props)
├── providers/        # React context providers
├── services/         # HTTP client, env — no UI
├── store/            # Client state
├── styles/           # CSS (global.css, app.css, …)
├── App.tsx           # Root layout shell
├── main.tsx          # Entry: mounts router to #root
├── router.tsx        # Routes (currently renders App)
└── vite-env.d.ts     # Types for import.meta.env
```

### Root files

| File | Role |
|------|------|
| **main.tsx** | Loads `styles/global.css`, renders `AppRouter` in `StrictMode`. |
| **App.tsx** | App shell (header, layout). |
| **router.tsx** | Navigation; add `react-router-dom` here when needed. |
| **vite-env.d.ts** | Typings for `VITE_*` env vars. |

### Folders

| Folder | Role | Examples |
|--------|------|----------|
| **assets/** | Static files | `.svg`, `.png` |
| **auth/** | Auth-only UI/logic | login form, token helpers |
| **components/** | Shared UI | `Button`, `Card` |
| **enums/** | Constants | board types, roles |
| **interfaces/** | Types only | `Padlet`, `User` |
| **providers/** | Context wrappers | `AuthProvider` |
| **services/** | API + config | see below |
| **store/** | Global state | session, UI state |
| **styles/** | Stylesheets | `global.css`, `app.css` |

### `services/`

| File | Role |
|------|------|
| `env.ts` | `VITE_API_URL` |
| `http-client.ts` | Typed `fetch`, `ApiError` |
| `index.ts` | Re-exports |

```ts
import { httpClient } from './services';
```
