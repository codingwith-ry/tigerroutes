# TigerRoutes README File

TigerRoutes is a React web application for delivering career-assessment and counseling UIs. It was bootstrapped with Create React App and includes server-side helpers under the `server/` folder.

**This README** provides a quick overview, development setup, project layout, and pointers to important docs included in the repository.

**Tech stack:** React, Node.js (Express), Tailwind CSS (config present), and small Python scoring helper.

**Apps & data:** The repo contains both the client (`src/`) and a lightweight server (`server/`) used for API routes, auth, and test fixtures.

**Quick Links:**
- **File:** [README.md](README.md)
- **Docs folder:** [docs](docs)

## Development

Prerequisites:
- Node.js 16+ and npm (or yarn)

Install dependencies:

```
npm install
```

Run the app in development mode (client + hot reload) + NodeJS Backend  + Python Scoring Engine:
**THIS IS THE COMMAND THAT WILL RUN THE SYSTEM ALTOGETHER (FRONTEND, BACKEND, SCORING ENGINE)**
## npm run dev


## Available scripts

- `npm run dev:frontend` — runs the React development server for the frontend (localhost:3000)
- `npm run dev:node` — runs the NodeJS Backend
- `npm run dev:python` — starts python server with FastAPI
- `npm run build` — builds a production bundle into `build/`


## Project structure (important parts)

- `src/` — React client application (User-side, Admin-side, Visitor-side components)
- `public/` — static public assets
- `build/` — production build output (generated)
- `server/` — Express routes, middleware, tests, and helper data
- `docs/` — project docs and troubleshooting notes (see files like `ADMIN_ROUTE_MOUNTING_ISSUE.txt`)

Notable source files:
- `src/index.js` — app entry
- `src/App.js` — main app shell
- `src/utils/` and `server/middleware/` — auth helpers and middleware

## Important docs and data

- See the `docs/` folder for operational notes and known issues.
- `server/ProgramProfiles.json` and `server/accurateProgramProfiles.json` contain sample program/profile data used by the app.

## Deployment

Build for production and deploy the `build/` folder to any static host (Netlify, Vercel, S3, etc.) or serve via Node/Express for SSR-like behavior.

```
npm run build
```

If you're deploying the server parts, ensure environment variables used by the server (JWT secrets, DB URLs) are configured in your host environment.

## Where to look next

- Admin routes and notes: see files under `server/` and `docs/` for common admin issues.
- Styling: `tailwind.config.js` is present — adjust if you update Tailwind usage.

If you'd like, I can also:
- add a short `CONTRIBUTING.md` and `CODE_OF_CONDUCT.md`
- run the test suite and report failures (or fix anything obvious)

---
Generated and trimmed from the original CRA README to focus on this project's specifics.
