#!/bin/bash
set -e

# This script runs when PostgreSQL initializes for the first time
# It ensures the database is created with proper settings

echo "Initializing Papermark database..."

# The POSTGRES_DB variable already creates the database, but we can add
# additional initialization here if needed

echo "Database initialization complete!"
