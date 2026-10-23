# Engineering Growth Hub

An exercise-driven software engineering and technical leadership learning platform. See `docs/PRODUCT.md`, `docs/ARCHITECTURE.md`, and `docs/ROADMAP.md` for the full requirements, stack rationale, and milestone plan.

**Status:** Milestone 0 (bootstrap) complete — monorepo scaffold, Postgres via Docker Compose, a health endpoint, and a frontend page that calls it. No curriculum content is seeded yet.

## Repository layout

```text
apps/
  web/   # Next.js App Router + TypeScript + Tailwind
  api/   # Flask app factory + SQLAlchemy + Flask-Migrate
docs/
  decisions/   # ADRs
compose.yaml   # Postgres + api + web for local development
```

## Prerequisites

- Docker and Docker Compose (recommended path), **or** Node.js 22+ and Python 3.12+ for running each app natively.

## Run everything with one command

```bash
make up
```

This copies `.env.example` to `.env` on first run (if `.env` doesn't exist yet) and runs `docker compose up --build`. Equivalent to:

```bash
cp .env.example .env
docker compose up --build
```

Other targets: `make down`, `make logs`, `make ps`, `make test` (runs both suites — requires the native `apps/api/.venv` and `apps/web/node_modules` setup below to exist first).

- Frontend: http://localhost:3000
- API health check: http://localhost:5000/api/v1/health
- Postgres: localhost:5432 (user/db from `.env`)

The frontend page calls the API's health endpoint from the browser and shows a loading, error, or success state depending on whether the API is reachable.

Stop with `docker compose down` (add `-v` to also drop the Postgres volume).

## Run natively (without Docker)

### API (Flask)

```bash
cd apps/api
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements-dev.txt
cp .env.example .env   # adjust DATABASE_URL if not using the Compose Postgres
flask run
```

The API defaults to `postgresql+psycopg://egh:egh@localhost:5432/engineering_growth_hub`. Either run `docker compose up db` to get a local Postgres, or point `DATABASE_URL` at your own instance.

Run tests:

```bash
cd apps/api
source .venv/bin/activate
pytest
```

### Web (Next.js)

```bash
cd apps/web
npm install
cp .env.example .env.local   # NEXT_PUBLIC_API_BASE_URL defaults to http://localhost:5000
npm run dev
```

Run tests and lint:

```bash
cd apps/web
npm test
npm run lint
```

## Database migrations

Schema migrations live in `apps/api/migrations` (Flask-Migrate/Alembic). No models exist yet, so there is nothing to migrate in Milestone 0. Once models are added (Milestone 1):

```bash
cd apps/api
source .venv/bin/activate
flask db migrate -m "describe the change"
flask db upgrade
```

## Troubleshooting

- **`apps/web/.next` owned by `root` on the host.** If `npx tsc --noEmit` in `apps/web` fails with `Type "..." does not satisfy the constraint 'AppRoutes'` for a route that otherwise looks correct, or `next dev`/`next typegen` can't write there, check `ls -la apps/web/.next` — if it's root-owned, fix it with:

  ```bash
  sudo rm -rf apps/web/.next
  ```

  It's pure build cache (regenerated automatically, never committed), so this is always safe. Until it's fixed, new dynamic routes should type `params` as a plain `Promise<{ id: string }>` instead of Next's generated `PageProps<"/exact/route">` helper, which depends on that directory being writable.

- **Added a frontend npm dependency but the running dev container can't resolve it.** `apps/web`'s `node_modules` inside the `web` container is a separate Docker volume (`web-node-modules`), not the bind-mounted source tree — installing on the host alone doesn't reach the container. Run both:

  ```bash
  cd apps/web && npm install
  docker compose exec web npm install
  ```

- **`docker compose exec api flask seed` (or any command needing `CONTENT_DIR`) fails with `IndexError`.** `compose.yaml`'s `api` service only bind-mounts `./apps/api` to `/app` — `content/curriculum/` at the repo root isn't visible inside the container at all, so `app/seed.py`'s path arithmetic runs out of parent directories. Run seeding from the host venv instead, same environment `pytest` already uses:

  ```bash
  cd apps/api && source .venv/bin/activate
  APP_ENV=development FLASK_APP=wsgi.py CORS_ORIGINS=http://localhost:3000 \
    DATABASE_URL=postgresql+psycopg://egh:egh@localhost:5432/engineering_growth_hub \
    flask seed
  ```

## What's intentionally not here yet

- No curriculum content (domains/topics/lessons) is seeded — that's Milestone 1.
- No authentication beyond a future local single-user stub — see `docs/ARCHITECTURE.md`.
- No AWS resources, payments, or billing — out of scope until explicitly requested.
- No shadcn/ui components installed yet; Tailwind is configured and components will be added as the UI needs them.
