# SideQuest Overlay Backend

FastAPI backend with WebSocket broadcasting, OpenAI integration, and static SF POI database.

## Quick Start with Poetry

### Install Poetry (if you don't have it)
```bash
curl -sSL https://install.python-poetry.org | python3 -
```

### Setup
```bash
cd backend

# Install dependencies
poetry install

# Copy and configure .env
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY
```

### Run the Server

**Option 1: Using the script**
```bash
./run_server.sh
```

**Option 2: Using poetry directly**
```bash
poetry run uvicorn main:app --reload --port 8787
```

**Option 3: Using the poetry script**
```bash
poetry run start
```

**Option 4: Enter poetry shell**
```bash
poetry shell
uvicorn main:app --reload --port 8787
```

## Testing

### Simple Test (no OpenAI required)
```bash
poetry run python simple_test.py
```

### Full Demo with AI (requires OpenAI API key)
```bash
poetry run python demo_livestream.py
```

### Original Test Suite
```bash
poetry run python test_api.py
```

## API Endpoints

- `GET /` - Health check
- `GET /api/state` - Get current game state
- `POST /api/location` - Update GPS position
- `POST /api/camera` - Process camera AI description
- `POST /api/objective` - Set objective manually
- `POST /api/message` - Send notification message
- `POST /update` - Full state update
- `WebSocket /ws` - Real-time state broadcasting

## Dependencies

All managed by Poetry in `pyproject.toml`:
- fastapi
- uvicorn[standard]
- websockets
- pydantic
- openai
- python-dotenv

## No venv needed!

Poetry handles virtual environment automatically. Just use `poetry run <command>` or `poetry shell`.

