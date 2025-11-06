#!/bin/sh
set -e

echo "Starting Papermark self-hosted instance..."

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL..."
until node -e "
const { Client } = require('pg');
const client = new Client({
  connectionString: process.env.POSTGRES_PRISMA_URL_NON_POOLING
});
client.connect()
  .then(() => { console.log('PostgreSQL is ready'); client.end(); })
  .catch(() => { console.log('Waiting...'); process.exit(1); });
" 2>/dev/null; do
  sleep 2
done

echo "PostgreSQL is ready!"

# Run database migrations
echo "Running database migrations..."
npx prisma migrate deploy || {
  echo "Migration failed, but continuing... (this is expected on first run)"
}

echo "Starting application..."
exec "$@"
