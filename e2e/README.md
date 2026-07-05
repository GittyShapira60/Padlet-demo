# E2E Tests — Padlet Demo

## Prerequisites
Docker must be running before executing tests:
```
docker compose up --build
```

## Setup (first time only)
```
cd e2e
npm install
```

## Run tests with UI (recommended)
```
cd e2e
npm run cy:open
```

## Run tests headlessly
```
cd e2e
npm run cy:run
```

## Test coverage
| File | What it tests |
|------|---------------|
| 01-auth.cy.ts | Register, login, logout, validation errors |
| 02-padlet.cy.ts | Create padlet, view creator info, add post |
| 03-post.cy.ts | Three-dots menu, delete post |
| 04-sharing.cy.ts | Public link access, redirect after login |
