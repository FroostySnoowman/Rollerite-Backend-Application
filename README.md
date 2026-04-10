# Rollerite Todos

React (TypeScript) + Vite frontend, Cloudflare Worker API in **`api/`**, D1 migrations in **`db/migrations/`**. UI takes cues from [`reference/`](reference/) (tokens, typography) without copying its full layout.

## Features

- Todos: add, edit, remove; per-row actions.
- Light / dark theme.
- Routes: **Home** (`/`) and **Tasks** (`/tasks`).
- API: `GET/POST /api/todos`, `PATCH/DELETE /api/todos/:id`.

## Prerequisites

- Node.js compatible with Vite 5 (see [Vite docs](https://vite.dev/guide/#scaffolding-your-first-vite-project)).
- npm.
- Cloudflare account for Worker + D1 + (optional) Pages.

---

## Cloudflare setup

### Worker + D1

1. **Wrangler:** `wrangler login` (global or `npx` from `api/`).

2. **Install API deps:** `cd api && npm install`

3. **Create D1** (name must match `database_name` in [`api/wrangler.toml`](api/wrangler.toml), default `rollerite_todos`):

   ```bash
   cd api
   npx wrangler d1 create rollerite_todos
   ```

   Put the printed **`database_id`** into `wrangler.toml` under `[[d1_databases]]`. Keep **`binding = "DB"`** (used in code).

4. **Migrations** live in [`db/migrations/`](db/migrations/) (`migrations_dir` in `wrangler.toml` points there).

   ```bash
   cd api
   npm run db:apply:local    # Miniflare / wrangler dev
   npm run db:apply:remote   # hosted D1
   ```

   New SQL: add files under `db/migrations/` or `npx wrangler d1 migrations create rollerite_todos "message"`.

5. **Deploy Worker:** `cd api && npm run deploy` — first run creates the Worker. Note the **`*.workers.dev`** URL.

### CORS (`FRONTEND_ORIGIN`)

Browsers call the Worker on its own origin, so the Worker must allow your app’s origin. Set in [`api/wrangler.toml`](api/wrangler.toml) `[vars]` or in the dashboard (Worker → **Variables**), e.g.:

`https://<your-pages>.pages.dev,http://localhost:5173`

(comma-separated, no spaces.)

### Frontend build (`VITE_API_URL`)

Production builds **require `VITE_API_URL`** in the **build environment** (not committed): your Worker **origin only**, no path, no trailing slash.

**Cloudflare Pages:** **Settings → Environment variables** → add **`VITE_API_URL`** as a **Secret** (or variable), value = Worker URL, enabled for **Build** (and the environment you deploy, e.g. Production).

`npm run dev` does **not** need it — Vite proxies `/api` to the local Worker.

### Optional: remote D1 while developing

```bash
cd api
npx wrangler dev --remote
```

See Cloudflare’s [D1 local development](https://developers.cloudflare.com/d1/best-practices/local-development/) if you need `preview_database_id`.

---

## Local development

**API**

```bash
cd api
npm install
npm run db:apply:local
npm run dev
```

Default Worker URL: `http://127.0.0.1:8787`. Change port if busy; match [`frontend/vite.config.ts`](frontend/vite.config.ts) `server.proxy['/api'].target`.

**Frontend**

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

---

## Smoke test

```bash
curl -s http://127.0.0.1:8787/api/todos
curl -s -X POST http://127.0.0.1:8787/api/todos -H 'Content-Type: application/json' -d '{"title":"Hello"}'
```

---

## Layout

| Path | Role |
|------|------|
| `frontend/` | Vite + React SPA; HTTP client in `src/api/todos.ts` |
| `api/` | Worker, `wrangler.toml` |
| `db/migrations/` | D1 SQL |
| `reference/` | Visual reference (gitignored at repo root) |
