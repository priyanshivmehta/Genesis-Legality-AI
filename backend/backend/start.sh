#!/usr/bin/env bash

# Exit on error
set -e

# Get port from environment variable or use default
PORT=${PORT:-8000}

# Start the FastAPI application with Gunicorn + Uvicorn workers
gunicorn app:app \
  -k uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:${PORT} \
  --workers 4 \
  --worker-class uvicorn.workers.UvicornWorker \
  --access-logfile - \
  --error-logfile -
