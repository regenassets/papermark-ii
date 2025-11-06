#!/bin/bash
# Papermark Backup Script
# This script backs up PostgreSQL database and MinIO data

set -e

BACKUP_DIR="./backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "Starting Papermark backup..."

# Backup PostgreSQL database
echo "Backing up PostgreSQL database..."
docker compose exec -T postgres pg_dump -U papermark papermark > "$BACKUP_DIR/database.sql"
echo "Database backup completed: $BACKUP_DIR/database.sql"

# Backup MinIO data (using MinIO client)
echo "Backing up MinIO data..."
docker compose exec -T minio-setup sh -c "
  mc alias set backup http://minio:9000 \$MINIO_ROOT_USER \$MINIO_ROOT_PASSWORD
  mc mirror backup/papermark-documents /tmp/backup
" || echo "Note: MinIO backup requires minio-setup container to be running"

# Alternative: Backup MinIO data volume directly
docker run --rm \
  -v papermark_minio_data:/data \
  -v "$(pwd)/$BACKUP_DIR":/backup \
  alpine tar czf /backup/minio-data.tar.gz -C /data .
echo "MinIO data backup completed: $BACKUP_DIR/minio-data.tar.gz"

# Create backup info file
cat > "$BACKUP_DIR/backup-info.txt" << EOF
Papermark Backup
Created: $(date)
Database: PostgreSQL
Storage: MinIO
EOF

echo "Backup completed successfully!"
echo "Location: $BACKUP_DIR"
echo ""
echo "To restore this backup, run: ./docker/restore.sh $BACKUP_DIR"
