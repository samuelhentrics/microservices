# How to run the stack with Docker

This repository contains three parts:

- `db/` : contains DB init scripts (Postgres)
- `back/` : a minimal Express backend (register/login) connecting to Postgres
- `front/` : Angular front (built and served by nginx)

To build and run everything locally using Docker Compose:

```bash
cd /path/to/this/repo
docker compose up --build
```

Services:
- Postgres on port 5432 (database: `login_db`, user `login_user`, password `login_pass`)
- Backend on port 3000 (API under `/api`)
- Front served on host port 4200 (nginx proxies `/api` to backend)

Notes:
- The Postgres init SQL is in `db/init-db/init.sql` and will be executed on first container start.
- In production you should secure credentials and consider using secrets or env files.
- The backend is intentionally minimal; for real projects add JWT, validation, rate-limits, better error handling.
