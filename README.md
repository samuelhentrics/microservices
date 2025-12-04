# Microservices Example Project

This repository contains a small microservices example used for teaching and development. It includes separate backend services (authentication, products, carts, monitoring), a frontend (Angular), and a reverse proxy (nginx). Services run in Docker Compose for easy local development.

## Architecture overview

- `back/authentification` — Node/Express service providing JWT-based auth, Google sign-in and user APIs.
- `back/products` — Products microservice exposing product listing and details.
- `back/carts` — Carts microservice storing carts and cart_items in Postgres; provides create/add/remove/list endpoints.
- `back/monitoring` — Lightweight monitoring service that periodically probes health endpoints of other services and logs to Postgres.
- `front` — Angular single-page application that consumes the APIs and runs with `ng serve` in development.
- `deploy/nginx` — Nginx reverse-proxy configuration used by the Compose stack to route `/api/*` to the proper backend and serve the Angular dev server.

Each backend service uses its own Postgres database defined in `docker-compose.yml` for isolation.

## Prerequisites

- Docker and Docker Compose (tested with Docker Desktop / Compose v2)
- Node.js (only required if you run the frontend outside Docker)

## Quick start (recommended)

Start all services with Docker Compose (builds images on first run):

```bash
docker compose up --build
```

This will build and start all services. Important ports configured by the compose file:

- `http://localhost` (nginx reverse-proxy)
- `http://localhost:4200` (Angular dev server proxied by nginx)
- `http://localhost:3000` (note: in this compose stack some services publish different host ports; prefer using the proxy at `http://localhost` for API calls)

Use the proxy for API requests so routing and CORS behave as in development:

```bash
curl http://localhost/api/carts/health
```

You should get a JSON health response from the carts service.

## Running a single service locally (optional)

If you need to work on one microservice without Docker rebuilds, run it locally with Node (example for `carts`):

```bash
cd back/carts/microservice
npm install
NODE_ENV=development PORT=3000 DATABASE_URL=postgres://user:password@localhost:5435/carts node src/index.js
```

When running services locally, ensure the Postgres DB is reachable (you can use the Docker Compose DB containers and map ports as needed).

## Frontend

The Angular frontend is in `front/` and is configured to run with live reload. You can run it inside the `front` container (compose does this by default) or locally:

Local (requires Node):

```bash
cd front
npm install
npm run start -- --host 0.0.0.0 --port 4200
```

When using the Angular dev server, the nginx reverse-proxy in Compose forwards `/api/*` calls to the appropriate backend.

## Useful developer commands

- Show running containers and port mappings:

```bash
docker compose ps
```

- View logs (tail last 200 lines) for `carts` microservice:

```bash
docker compose logs --no-color --tail=200 carts
```

- Inspect which process listens on a host port (macOS):

```bash
sudo lsof -nP -iTCP:3000 -sTCP:LISTEN
```

- Send a request through the nginx proxy (recommended):

```bash
curl -v http://localhost/api/carts/health
```

## Troubleshooting

- Route ordering: Express matches routes in registration order. If you see database UUID parse errors for `/api/carts/health` (e.g. invalid input syntax for type uuid: "health"), ensure the explicit `/api/carts/health` route is registered before the parameterized `/api/carts/:cartId` route in `back/carts/microservice/src/index.js`.
- Unexpected JSON like `{"message":"Unauthorized"}` when hitting `http://localhost:3000` usually means the host port 3000 is bound by a different service (e.g. Grafana) — prefer calling the nginx proxy at `http://localhost` or expose a separate host port for the target service in `docker-compose.yml`.
- TypeScript / Angular errors: see `front` logs when running compose, or run `npm run build` locally inside `front` to get clearer TypeScript errors.

## Project structure

Top-level layout:

```
back/
	authentification/
	products/
	carts/
	monitoring/
front/
deploy/nginx/
docker-compose.yml
```

## Notes & development tips

- The monitoring service uses environment variables like `CARTS_URL` to select which endpoint to probe — `docker-compose.yml` sets this to the container hostnames used inside the Compose network.
- Use the nginx proxy for an environment close to production routing behavior; direct container ports are useful for debugging but can be confusing due to host port collisions.

---

If you'd like, I can:

- Add a `Makefile` or top-level npm scripts to simplify common tasks (start, stop, logs, build).
- Add a short CONTRIBUTING.md with flows for running tests and making changes.

Tell me which you'd prefer and I'll add it.

