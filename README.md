# Outlet Audit

Mobile-first restaurant operations audit application with a React/Vite/Tailwind frontend and a FastAPI/MongoDB API. It opens directly to the audit register; no authentication or login flow is present.

## Run locally with MongoDB

The complete, deployable stack is defined in `docker-compose.yml`:

```sh
docker compose up --build
```

Open `http://localhost:5173`. This starts exactly one MongoDB collection (`audits`), the FastAPI CRUD service, and the production frontend gateway.

## Frontend development

```sh
pnpm install
pnpm dev
```

The Vite server runs at `http://127.0.0.1:5173` and proxies `/audits` to `http://127.0.0.1:8000`.

## API development

Start MongoDB first, then:

```sh
PYTHONPATH=backend/.deps python3 -m uvicorn backend.main:app --reload
```

Install API dependencies into an environment of your choice from `backend/requirements.txt` for normal development or deployment. The API exposes only:

- `GET /audits`
- `GET /audits/{id}`
- `POST /audits`
- `PUT /audits/{id}`
- `DELETE /audits/{id}`

If the API is temporarily offline, audits continue to be autosaved to browser storage and are recovered after refresh. When the API reconnects, locally held audits sync to MongoDB.

## Key behavior

- Twelve required audit parameters, with editable / addable / removable checkpoints.
- Pass, fail, and N/A scoring; parameter and overall scores are calculated automatically.
- Evidence is resized to a maximum 800px, compressed as JPEG at 0.7 quality, converted to base64, then persisted with its checkpoint.
- Summary red flags, clipboard copy, and a browser-print A4 report are included.
