# AxiomHosting

AxiomHosting is organized as one project containing the existing Vite/React website, a TypeScript/Express API, and PostgreSQL schema initialization.

## Project layout

```text
AxiomHosting/
├── website/          # Existing Vite + React frontend
├── api/              # TypeScript + Express backend
├── database/init/    # PostgreSQL schema and initial development plans
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

## Start the API and database

Docker Compose reads values from a local `.env` file. Create it once and replace the example password with a strong, unique development password:

```bash
cp .env.example .env
docker compose up --build -d
```

The API is then available at `http://localhost:3000` by default:

```bash
curl http://localhost:3000/api/health
curl http://localhost:3000/api/plans
curl http://localhost:3000/api/servers
```

Stop the containers without deleting database data:

```bash
docker compose down
```

View live logs:

```bash
docker compose logs -f
docker compose logs -f api
docker compose logs -f postgres
```

Open a PostgreSQL shell inside its private container:

```bash
docker compose exec postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"
```

If your shell has not loaded `.env`, substitute the values from that file explicitly. To inspect the database with the same limited role as the API, use `APP_DB_USER` instead. PostgreSQL deliberately has no host port mapping, so it is reachable by the API over Docker's `backend` network but not exposed publicly.

The database is stored in Docker's named `postgres_data` volume. `docker compose down` keeps it; `docker compose down -v` permanently deletes it. Initialization SQL runs only when Docker creates a fresh, empty volume.

## Develop the website

The existing frontend remains independently runnable:

```bash
cd website
npm ci
npm run dev
```

Build it with `npm run build` from `website/`.

## Develop the API outside Docker

PostgreSQL is intentionally not published to the host. The normal development path is to run the API with Compose. If you deliberately add a localhost-only PostgreSQL port mapping for debugging, install API dependencies and run:

```bash
cd api
npm ci
npm run dev
```

Set `POSTGRES_HOST=localhost` for that mode. Do not expose port 5432 on a public interface.

## Environment variables

- `POSTGRES_DB`: PostgreSQL database name.
- `POSTGRES_USER`: PostgreSQL bootstrap administrator, used for schema setup and manual administration.
- `POSTGRES_PASSWORD`: bootstrap administrator password; no real password is committed.
- `APP_DB_USER`: limited PostgreSQL role used by the API.
- `APP_DB_PASSWORD`: password for the API's limited database role.
- `API_PORT`: host port for the API (defaults to `3000`).
- `NODE_ENV`: runtime mode (`development` or `production`).
- `CORS_ORIGIN`: exact website origin allowed by browser CORS.
- `VITE_*`: optional public website configuration; values are visible to browsers and must never contain secrets.

## Database notes

`database/init/001_initial_schema.sql` creates users, servers, plans, credit balances, credit transactions, and subscriptions with foreign keys, validation constraints, indexes, and automatic `updated_at` triggers. It inserts three development hosting plans. No payment, credit-processing, authentication, or Pterodactyl behavior is implemented yet.

Pushes to `main` continue to deploy the website through GitHub Pages.
