# Quick Start Guide

Get the SideQuest Overlay running in 2 minutes!

## Prerequisites

Install Poetry (one-time setup):
```bash
curl -sSL https://install.python-poetry.org | python3 -
```

## Setup

```bash
# Clone/navigate to the project
cd /path/to/squaas

# Backend setup
cd backend
poetry install
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY

# Frontend setup  
cd ../frontend
npm install

# Done!
```

## Run

**Terminal 1 - Backend:**
```bash
cd backend
poetry run uvicorn main:app --reload --port 8787

# OR use the script:
./run_server.sh
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

**Terminal 3 - Test it (optional):**
```bash
cd backend

# Simple test (no OpenAI needed)
poetry run python simple_test.py

# Full demo with AI
poetry run python demo_livestream.py
```

## View

- **In Browser**: http://localhost:3000
- **In OBS**: Add Browser Source → `http://localhost:3000` (1920x1080)

## Common Commands

```bash
# Backend
cd backend
poetry run uvicorn main:app --reload --port 8787  # Start server
poetry run python simple_test.py                   # Quick test
poetry run python demo_livestream.py               # Full demo
poetry shell                                       # Enter poetry env

# Frontend
cd frontend
npm run dev                                        # Start dev server
npm run build                                      # Production build

# Check status
curl http://localhost:8787/                        # Backend health
curl http://localhost:8787/api/state               # Current state
```

## No Virtual Environment Management!

Poetry handles everything. Just use:
- `poetry run <command>` - Run any command in Poetry's environment
- `poetry shell` - Enter the environment (then run commands normally)
- `poetry install` - Install/update dependencies
- `poetry add <package>` - Add new package

That's it! No `venv`, no `activate`, no hassle.

