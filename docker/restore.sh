#!/bin/bash
# Papermark Restore Script
# This script restores PostgreSQL database and MinIO data from a backup

set -e

if [ -z "$1" ]; then
  echo "Usage: ./docker/restore.sh <backup-directory>"
  echo "Example: ./docker/restore.sh ./backups/20250105_143000"
  exit 1
fi

BACKUP_DIR="$1"

if [ ! -d "$BACKUP_DIR" ]; then
  echo "Error: Backup directory not found: $BACKUP_DIR"
  exit 1
fi

echo "WARNING: This will overwrite your current database and files!"
echo "Backup directory: $BACKUP_DIR"
read -p "Are you sure you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
  echo "Restore cancelled."
  exit 0
fi

echo "Starting Papermark restore..."

# Restore PostgreSQL database
if [ -f "$BACKUP_DIR/database.sql" ]; then
  echo "Restoring PostgreSQL database..."
  docker compose exec -T postgres psql -U papermark -d papermark -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
  docker compose exec -T postgres psql -U papermark papermark < "$BACKUP_DIR/database.sql"
  echo "Database restore completed!"
else
  echo "Warning: database.sql not found in backup directory"
fi

# Restore MinIO data
if [ -f "$BACKUP_DIR/minio-data.tar.gz" ]; then
  echo "Restoring MinIO data..."
  docker compose stop minio
  docker run --rm \
    -v papermark_minio_data:/data \
    -v "$(pwd)/$BACKUP_DIR":/backup \
    alpine sh -c "rm -rf /data/* && tar xzf /backup/minio-data.tar.gz -C /data"
  docker compose start minio
  echo "MinIO data restore completed!"
else
  echo "Warning: minio-data.tar.gz not found in backup directory"
fi

echo "Restore completed successfully!"
echo "Please restart the application: docker compose restart papermark"
