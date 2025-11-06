# Papermark Docker Setup

This directory contains scripts and configurations for self-hosting Papermark with Docker.

## Quick Start

Run the interactive quick-start script:

```bash
./docker/quick-start.sh
```

This script will:
1. Check Docker installation
2. Generate secure passwords and secrets
3. Create and configure `.env` file
4. Prompt for domain configuration
5. Start all services

## Directory Structure

```
docker/
├── README.md                 # This file
├── quick-start.sh           # Interactive setup script
├── backup.sh                # Database and storage backup script
├── restore.sh               # Restore from backup script
└── init-db.sh              # PostgreSQL initialization script
```

## Scripts

### quick-start.sh

Interactive setup wizard that guides you through the initial configuration.

```bash
./docker/quick-start.sh
```

### backup.sh

Creates a timestamped backup of PostgreSQL database and MinIO storage.

```bash
./docker/backup.sh
```

Backups are stored in `./backups/YYYYMMDD_HHMMSS/`

### restore.sh

Restores PostgreSQL database and MinIO storage from a backup directory.

```bash
./docker/restore.sh ./backups/20250105_143000
```

**Warning**: This will overwrite existing data!

### init-db.sh

PostgreSQL initialization script that runs when the database is first created. Currently minimal, but can be extended with custom SQL scripts.

## Manual Setup

If you prefer manual setup over the quick-start script:

### 1. Create Environment File

```bash
cp .env.docker .env
```

### 2. Generate Secrets

```bash
# Generate secrets
NEXTAUTH_SECRET=$(openssl rand -base64 32)
DOCUMENT_PASSWORD_KEY=$(openssl rand -base64 32)
POSTGRES_PASSWORD=$(openssl rand -base64 16)
MINIO_ROOT_PASSWORD=$(openssl rand -base64 16)
REDIS_PASSWORD=$(openssl rand -base64 16)

# Update .env manually or with sed
sed -i "s|NEXTAUTH_SECRET=.*|NEXTAUTH_SECRET=$NEXTAUTH_SECRET|" .env
sed -i "s|DOCUMENT_PASSWORD_KEY=.*|DOCUMENT_PASSWORD_KEY=$DOCUMENT_PASSWORD_KEY|" .env
sed -i "s|POSTGRES_PASSWORD=.*|POSTGRES_PASSWORD=$POSTGRES_PASSWORD|" .env
sed -i "s|MINIO_ROOT_PASSWORD=.*|MINIO_ROOT_PASSWORD=$MINIO_ROOT_PASSWORD|" .env
sed -i "s|REDIS_PASSWORD=.*|REDIS_PASSWORD=$REDIS_PASSWORD|" .env
```

### 3. Update Domain Configuration

Edit `.env` and set:
- `NEXTAUTH_URL`
- `NEXT_PUBLIC_BASE_URL`
- `NEXT_PUBLIC_MARKETING_URL`
- `NEXT_PUBLIC_APP_BASE_HOST`
- `MINIO_ENDPOINT`

### 4. Start Services

```bash
# Without Nginx (direct access on port 3000)
docker compose up -d

# With Nginx (for SSL/production)
docker compose --profile with-nginx up -d
```

## Common Commands

### View Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f papermark
docker compose logs -f postgres
docker compose logs -f minio
```

### Check Service Status

```bash
docker compose ps
```

### Restart Services

```bash
# All services
docker compose restart

# Specific service
docker compose restart papermark
```

### Stop Services

```bash
docker compose down
```

### Update Papermark

```bash
# Backup first
./docker/backup.sh

# Pull latest code
git pull origin main

# Rebuild and restart
docker compose down
docker compose up -d --build
```

### Access Container Shell

```bash
# Papermark app
docker compose exec papermark sh

# PostgreSQL
docker compose exec postgres psql -U papermark papermark

# MinIO client
docker compose exec minio-setup sh
```

## Automated Backups

To schedule automatic backups, add to your crontab (`crontab -e`):

```cron
# Daily backup at 2 AM
0 2 * * * cd /path/to/papermark && ./docker/backup.sh

# Weekly cleanup - keep only last 4 weeks of backups
0 3 * * 0 find /path/to/papermark/backups -type d -mtime +28 -exec rm -rf {} +
```

## Troubleshooting

### Permission Issues

If you encounter permission issues with volumes:

```bash
# Fix ownership
sudo chown -R $USER:$USER ./nginx
docker compose down
docker volume rm papermark_postgres_data papermark_minio_data papermark_redis_data
docker compose up -d
```

### Reset Everything

To completely reset (WARNING: deletes all data):

```bash
docker compose down -v
rm .env
./docker/quick-start.sh
```

### Database Migration Issues

If migrations fail:

```bash
# Enter container
docker compose exec papermark sh

# Run migrations manually
npx prisma migrate deploy

# Or reset database (WARNING: deletes all data)
npx prisma migrate reset
```

## Security Notes

1. **Never commit `.env` to version control**
2. **Change default passwords** in production
3. **Use strong secrets** (32+ characters)
4. **Enable SSL/HTTPS** for production
5. **Restrict port access** - only expose 80/443
6. **Regular backups** - automate with cron
7. **Keep updated** - regularly update Docker images

## Support

For detailed documentation, see [SELF_HOSTING.md](../SELF_HOSTING.md)

For issues, visit: https://github.com/mfts/papermark/issues
