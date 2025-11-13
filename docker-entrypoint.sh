#!/bin/sh
set -e

echo "Starting Papermark self-hosted instance..."

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL..."
# Simple wait - rely on Docker healthchecks and retry logic in Prisma
sleep 10

# Run database migrations
echo "Running database migrations..."
npx prisma migrate deploy || {
  echo "Migration failed, but continuing... (this is expected on first run)"
}

echo "Starting application..."
exec "$@"
