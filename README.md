# ClauseAI 

Legal Contract Risk Analyzer — an integrated FastAPI backend and React/Next frontends that ingest contract documents, identify clauses, extract entities, and surface risk analyses and suggested redlines.

---

## Key Features

- AI-driven contract analysis pipeline (ingest → segment → analyze → explain)
- FastAPI backend for file upload and analysis endpoints
- React / Vite and Next.js frontends for interactive UI and dashboards
- Redline suggestions, executive summaries, and per-clause risk explanations
- Extensible playbook and LLM hooks for customizable analysis tone and behavior

## Quick Links

- Backend FastAPI entry: `backend/backend/app.py`
- Backend developer notes: [backend/README.md](backend/README.md)
- Frontend (Vite) app: `frontend/` — see [frontend/package.json](frontend/package.json)
- Frontend (Next) dashboard: `frontend/project/` — see [frontend/project/README_SETUP.md](frontend/project/README_SETUP.md)

---

## Getting Started (Developer)

Prerequisites

- Node.js (16+ recommended) and npm or yarn
- Python 3.9+ and `pip`
- Optional: an OpenAI API key if you want LLM polishing (set in backend/Risk_logic/.env)

1) Run the backend (FastAPI)

```bash
cd backend\backend\
# (optional) create and activate a virtualenv
python -m venv .venv
.\.venv\Scripts\activate

# Install dependencies (if you have a requirements.txt, prefer that):
pip install fastapi uvicorn python-dotenv python-multipart openai

# Start the API server (runs on http://localhost:8000)
uvicorn backend.app:app --reload --host 0.0.0.0 --port 8000
```

Notes:
- The FastAPI app expects an environment file at `backend/Risk_logic/.env` for `OPENAI_API_KEY` (if used). See `backend/backend/app.py` for the environment-loading behavior.

2) Run the frontend (Vite)

```bash
cd frontend
npm install
npm run dev
```

Open the app (Vite dev server) at the URL printed by Vite (usually http://localhost:5173).

---

## Usage Example — Analyze a Contract (curl)

This endpoint accepts a file upload (form) and a `perspective` form field.

```bash
curl -X POST "http://localhost:8000/analyze" \
  -F "file=@/path/to/contract.pdf" \
  -F "perspective=vendor"
```

The API returns a JSON analysis containing `summary`, `explanations`, and suggested redlines (see `backend/backend/Risk_logic/contract_analysis_output.json` after running the pipeline).

---

## Project Layout (high level)

- `backend/backend/` — Python backend and supporting tools
  - `backend/backend/app.py` — FastAPI entrypoint
  - `backend/backend/Risk_logic/` — contract analysis pipeline (ingestion, segmentation, intelligence, explainability, etc.)
  - `backend/README.md` — notes for the backend
- `frontend/` — Vite + React app (main UI)
  - `package.json` — scripts for dev/build
  - `project/` — a richer Next.js dashboard with its own `package.json` and setup notes

---

## Where to Get Help

- See backend notes: [backend/README.md](backend/README.md)
- See frontend dashboard setup: [frontend/project/README_SETUP.md](frontend/project/README_SETUP.md)
- Open an issue in this repository for bugs, feature requests, or questions.

---

## Contributing

Contributions are welcome. Please follow the project's contribution guidelines (if present) and open issues or pull requests. If you maintain a `CONTRIBUTING.md` or docs, link it here; otherwise open an issue to discuss larger changes.

Suggested starting points for contributors:

- Improve dependency management: add `requirements.txt` for the backend
- Add CI workflows and tests
- Add a `CONTRIBUTING.md` with contribution standards and code-of-conduct

---

## Maintainers

This repository is maintained by the project owners. For maintainers and contact details, please see the repository metadata, open an issue, or add an entry to `MAINTAINERS.md`.

---

## Notes & Next Steps

- This README focuses on quick onboarding for developers. For API details, advanced configuration, or troubleshooting, add dedicated docs under `docs/` or expand `backend/README.md` and `frontend/project/README_SETUP.md`.
- If you want, I can also generate a `requirements.txt` for the Python backend and a `CONTRIBUTING.md` template.

