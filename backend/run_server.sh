#!/bin/bash
cd "$(dirname "$0")"
echo "Starting backend server with Poetry..."
poetry run uvicorn main:app --reload --port 8787 --log-level debug

