# Rollerite Todos

Full-stack todo list: **React + TypeScript + Vite** frontend (UI aligned with [`reference/`](reference/)), **Cloudflare Worker** (JavaScript + Wrangler) API under **`/api/`**, and **D1** SQL migrations under **`/db/migrations/`**.

## Features

- Add, edit, and remove todos; each row has **Edit**, **Save** / **Cancel**, and **Remove** actions.
- Light / dark theme toggle (same token system as the reference app).
- **Home** landing (reference-inspired typography and colors, not a layout copy) and a **Tasks** page for the list.
- REST API: `GET/POST /api/todos`, `PATCH/DELETE /api/todos/:id`.

## Prerequisites

- **Node.js** 20.19+, 22.12+, or another [supported Vite 5](https://vite.dev/guide/#scaffolding-your-first-vite-project) version (Node 21 works with the pinned Vite 5 stack in this repo).
- **npm** (or use your preferred package manager consistently).
- A **Cloudflare account** (free tier is enough) when you deploy the Worker and remote D1.

---

## Cloudflare: full API setup

These steps assume the Worker lives in [`api/`](api/) and D1 migration **files** live in [`db/migrations/`](db/migrations/). [`api/wrangler.toml`](api/wrangler.toml) sets `migrations_dir = "../db/migrations"` so Wrangler always applies SQL from the **`db`** folder.

### 1. Install Wrangler and log in

From anywhere (or from `api/` after `npm install`):

```bash
npm install -g wrangler
# or use: npx wrangler ...
wrangler login
```

`wrangler login` opens a browser flow and stores credentials for the CLI. You need this before `d1 create`, `migrations apply --remote`, or `deploy`.

### 2. Install API dependencies

```bash
cd api
npm install
```

### 3. Create the D1 database (remote)

Pick a name that matches **`database_name`** in `wrangler.toml` (default: **`rollerite_todos`**), or change both to match your name.

```bash
cd api
npx wrangler d1 create rollerite_todos
```

Wrangler prints a **database id** (UUID). Copy it into [`api/wrangler.toml`](api/wrangler.toml):

```toml
[[d1_databases]]
binding = "DB"
database_name = "rollerite_todos"
database_id = "<paste-your-database-id-here>"
migrations_dir = "../db/migrations"
```

- **`binding`**: must stay **`DB`** unless you change the Worker code (`env.DB`).
- **`database_name`**: must match the name you passed to `wrangler d1 create` and to `wrangler d1 migrations apply <name>`.
- **`migrations_dir`**: relative to the **`api/`** directory (points at repo-root **`db/migrations`**).

Local dev can keep the placeholder `00000000-...` id for **local** SQLite only; **production** must use the real id from `d1 create` (or `wrangler d1 list`).

### 4. Apply migrations

**Local** (used by `wrangler dev` with Miniflare):

```bash
cd api
npm run db:apply:local
# same as: npx wrangler d1 migrations apply rollerite_todos --local
```

**Remote** (Cloudflare-hosted D1):

```bash
cd api
npm run db:apply:remote
# same as: npx wrangler d1 migrations apply rollerite_todos --remote
```

Add new SQL under **`db/migrations/`**, then run `apply` again. You can scaffold a numbered file from `api/`:

```bash
cd api
npx wrangler d1 migrations create rollerite_todos "describe_change"
```

That writes into **`migrations_dir`** (`../db/migrations`). Edit the generated `.sql`, then run `db:apply:local` / `db:apply:remote`.

### 5. Create / deploy the Worker

There is no separate “create Worker” button for this repo: the Worker is defined by **`api/wrangler.toml`** (`name = "rollerite-todos-api"`). The first deploy **creates** that Worker (or updates it if it already exists).

```bash
cd api
npm run deploy
# same as: npx wrangler deploy
```

After deploy, the dashboard shows **Workers & Pages** → your worker name → **Triggers** (URL like `https://rollerite-todos-api.<subdomain>.workers.dev`).

### 6. Variables and secrets

| Item | Purpose | How to set |
|------|---------|------------|
| **`FRONTEND_ORIGIN`** | Browser origins allowed for **CORS** (comma-separated, no spaces). Example: `https://<project>.pages.dev,http://localhost:5173` | Plain text: [`api/wrangler.toml`](api/wrangler.toml) `[vars]`, or Worker → **Variables** / **Secrets** in the dashboard. |
| **`VITE_API_URL`** (Pages **build**) | Worker origin baked into the SPA at build time | Pages → **Environment variables** → **Secrets** (recommended) named `VITE_API_URL`, scoped to **Build** (and the target environment). See §8. |
| **Other Worker secrets** (optional) | API keys, etc. | `cd api` then `npx wrangler secret put MY_SECRET` and read `env.MY_SECRET` in `src/index.js`. |

The Worker itself does not need a secret for basic todo CRUD; **`VITE_API_URL`** on Pages is the secret you configure so production builds succeed and the app calls your Worker instead of `pages.dev/api`.

### 7. Optional: `wrangler dev --remote`

To hit **remote** D1 while developing:

```bash
cd api
npx wrangler dev --remote
```

You may need a **`preview_database_id`** on the `[[d1_databases]]` block for preview DBs; see [D1 remote development](https://developers.cloudflare.com/d1/best-practices/local-development/).

### 8. Point the frontend at the deployed Worker (`VITE_API_URL`)

Production **`npm run build`** (including Cloudflare Pages) **fails unless `VITE_API_URL` is set** without using a one-off shell prefix. It must be your Worker’s **origin only** (no path, no trailing slash).

**Cloudflare Pages (preferred)**

1. Deploy the Worker from `api/` and copy its `*.workers.dev` origin.
2. Pages → **Settings → Environment variables** → choose **Production** / **Preview** as needed.
3. Add **`VITE_API_URL`** as a **Secret** (recommended) or variable, value = that origin.
4. Enable it for **Build** so `npm run build` on Pages sees it.

**Local production build** (e.g. testing `dist/` before upload)

From `frontend/`, create **`.env.production`** (gitignored via `.env.*`) containing exactly:

`VITE_API_URL=https://<your-worker>.workers.dev`

Then run **`npm run build`** only — do not use `VAR=value npm run build`. (Vite may also read `.env`; prefer **`.env.production`** so the Worker URL is not mixed with dev settings.)

`npm run dev` does **not** need `VITE_API_URL` (the dev server proxies `/api` to the local Worker).

Set **`FRONTEND_ORIGIN`** on the Worker to wherever the browser loads the SPA (e.g. `https://<project>.pages.dev`), comma-separated if you have several origins, so CORS allows those origins when calling the Worker URL.

---

## Local development (quick)

### API (Worker + local D1)

```bash
cd api
npm install
npm run db:apply:local
npm run dev
```

Default: **http://127.0.0.1:8787**. If the port is busy:

```bash
npx wrangler dev --port 8788
```

Update [`frontend/vite.config.ts`](frontend/vite.config.ts) `server.proxy['/api'].target` to match.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173**. The Vite dev server **proxies** `/api/*` to the local Worker. You do not need `VITE_API_URL` for dev; use a Pages Secret or **`frontend/.env.production`** only when producing a production bundle.

---

## Smoke test (optional)

With the Worker running:

```bash
curl -s http://127.0.0.1:8787/api/todos
curl -s -X POST http://127.0.0.1:8787/api/todos -H 'Content-Type: application/json' -d '{"title":"Hello"}'
```

---

## Project layout

| Path | Role |
|------|------|
| `frontend/` | Vite + React (TS) SPA |
| `api/` | Worker entry (`src/index.js`), `wrangler.toml`, Wrangler scripts |
| `db/migrations/` | D1 SQL migrations (referenced by `migrations_dir` in `api/wrangler.toml`) |
| `reference/` | Visual reference (ignored from git) |

The TypeScript HTTP client for `/api/todos` lives at **`frontend/src/api/todos.ts`** (not the same as the repo folder **`api/`**).
