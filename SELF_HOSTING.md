# Papermark Self-Hosting Guide

This guide will help you deploy Papermark on your own infrastructure using Docker Compose.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Detailed Setup](#detailed-setup)
- [SSL/HTTPS Configuration](#sslhttps-configuration)
- [Environment Variables](#environment-variables)
- [Backup and Restore](#backup-and-restore)
- [Troubleshooting](#troubleshooting)
- [Advanced Configuration](#advanced-configuration)

## Prerequisites

### Required

- **Server**: Linux server with at least 4GB RAM and 20GB storage
- **Docker**: Version 20.10 or higher
- **Docker Compose**: Version 2.0 or higher
- **Domain Name**: A domain pointing to your server's IP address

### Optional (for full features)

- **Resend API Key**: For sending emails ([sign up here](https://resend.com))
- **Google OAuth Credentials**: For Google Sign-In ([get here](https://console.cloud.google.com/apis/credentials))
- **Tinybird Account**: For analytics ([sign up here](https://www.tinybird.co))
- **Stripe Account**: For payments ([sign up here](https://stripe.com))

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/mfts/papermark.git
cd papermark
```

### 2. Configure Environment Variables

```bash
# Copy the template
cp .env.docker .env

# Generate secrets
openssl rand -base64 32  # Use for NEXTAUTH_SECRET
openssl rand -base64 32  # Use for DOCUMENT_PASSWORD_KEY
```

Edit `.env` and update the following **REQUIRED** variables:

```bash
# Security
NEXTAUTH_SECRET=<your-generated-secret>
DOCUMENT_PASSWORD_KEY=<your-generated-secret>

# URLs (replace with your domain)
NEXTAUTH_URL=https://your-domain.com
NEXT_PUBLIC_BASE_URL=https://your-domain.com
NEXT_PUBLIC_MARKETING_URL=https://your-domain.com
NEXT_PUBLIC_APP_BASE_HOST=your-domain.com

# Passwords
POSTGRES_PASSWORD=<strong-password>
MINIO_ROOT_PASSWORD=<strong-password>
REDIS_PASSWORD=<strong-password>
MINIO_ENDPOINT=your-domain.com:9000
```

### 3. Start the Services

```bash
# Start without Nginx (direct access on port 3000)
docker compose up -d

# OR start with Nginx (recommended for production)
docker compose --profile with-nginx up -d
```

### 4. Access Papermark

- **Without Nginx**: http://your-server-ip:3000
- **With Nginx**: http://your-domain.com (or https:// after SSL setup)
- **MinIO Console**: http://your-server-ip:9001

### 5. Create Your First Account

1. Navigate to your Papermark URL
2. Click "Sign Up" or "Get Started"
3. Create an account with email/password
4. You're ready to start using Papermark!

## Detailed Setup

### Architecture

The Docker Compose setup includes:

- **Papermark App**: Next.js application (port 3000)
- **PostgreSQL**: Database (port 5432)
- **MinIO**: S3-compatible storage (ports 9000, 9001)
- **Redis**: Caching and job queues (port 6379)
- **Nginx**: Reverse proxy with SSL support (ports 80, 443) - optional

### Service Details

#### PostgreSQL Database

- **Image**: postgres:16-alpine
- **Default Database**: papermark
- **Default User**: papermark
- **Data Volume**: `postgres_data`

#### MinIO Storage

- **Image**: minio/minio:latest
- **Default Bucket**: papermark-documents
- **Default User**: papermark (configurable via `MINIO_ROOT_USER`)
- **Console**: Access at http://server-ip:9001
- **Data Volume**: `minio_data`

#### Redis

- **Image**: redis:7-alpine
- **Password Protected**: Yes (via `REDIS_PASSWORD`)
- **Data Volume**: `redis_data`

### Deployment Options

#### Option 1: Without Nginx (Simplest)

Best for testing or when using external SSL termination (e.g., Cloudflare).

```bash
docker compose up -d
```

Access directly at: `http://server-ip:3000`

#### Option 2: With Nginx and SSL (Recommended for Production)

```bash
docker compose --profile with-nginx up -d
```

Then configure SSL (see [SSL/HTTPS Configuration](#sslhttps-configuration)).

## SSL/HTTPS Configuration

### Using Let's Encrypt (Recommended)

1. **Update Nginx configuration** with your domain:

```bash
# Edit nginx/conf.d/papermark.conf
# Replace 'your-domain.com' with your actual domain
nano nginx/conf.d/papermark.conf
```

2. **Generate SSL certificate**:

```bash
# Stop nginx temporarily
docker compose stop nginx

# Generate certificate
docker compose run --rm certbot certonly \
  --standalone \
  -d your-domain.com \
  -d www.your-domain.com \
  --email your-email@example.com \
  --agree-tos \
  --no-eff-email

# Start nginx
docker compose start nginx
```

3. **Auto-renewal** setup:

Add to crontab (`crontab -e`):

```cron
0 3 * * * cd /path/to/papermark && docker compose run --rm certbot renew && docker compose exec nginx nginx -s reload
```

### Using Cloudflare (Alternative)

If using Cloudflare for SSL termination:

1. Use the non-SSL Nginx config:

```bash
cp nginx/conf.d/papermark-no-ssl.conf.example nginx/conf.d/papermark.conf
```

2. Configure Cloudflare:
   - Set SSL/TLS mode to "Full" (not "Full (strict)")
   - Enable "Always Use HTTPS"
   - Add your domain to Cloudflare DNS

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXTAUTH_SECRET` | NextAuth encryption key (32+ chars) | Generate with `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Application URL with protocol | `https://papermark.example.com` |
| `NEXT_PUBLIC_BASE_URL` | Public base URL | `https://papermark.example.com` |
| `DOCUMENT_PASSWORD_KEY` | Document encryption key (32+ chars) | Generate with `openssl rand -base64 32` |
| `POSTGRES_PASSWORD` | PostgreSQL password | Strong random password |
| `MINIO_ROOT_PASSWORD` | MinIO admin password | Strong random password |
| `REDIS_PASSWORD` | Redis password | Strong random password |

### Optional Variables

#### Email (Resend)

```bash
RESEND_API_KEY=re_xxxxx
```

Without this, email features will be disabled.

#### Google OAuth

```bash
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxx
```

Without this, Google Sign-In will be unavailable.

#### Analytics (Tinybird)

```bash
TINYBIRD_TOKEN=p.xxxxx
```

Without this, detailed analytics will be unavailable.

#### Payments (Stripe)

```bash
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

Without this, payment features will be disabled.

## Backup and Restore

### Creating a Backup

```bash
./docker/backup.sh
```

This creates a timestamped backup in `./backups/` containing:
- PostgreSQL database dump
- MinIO data archive
- Backup metadata

### Restoring from Backup

```bash
./docker/restore.sh ./backups/20250105_143000
```

**Warning**: This will overwrite your current data!

### Automated Backups

Add to crontab for daily backups at 2 AM:

```cron
0 2 * * * cd /path/to/papermark && ./docker/backup.sh
```

## Troubleshooting

### Common Issues

#### 1. Database Connection Errors

**Symptom**: "Can't reach database server"

**Solution**:
```bash
# Check if PostgreSQL is running
docker compose ps postgres

# View PostgreSQL logs
docker compose logs postgres

# Restart PostgreSQL
docker compose restart postgres
```

#### 2. File Upload Errors

**Symptom**: "Failed to upload document"

**Solution**:
```bash
# Check MinIO is running
docker compose ps minio

# Check MinIO logs
docker compose logs minio

# Verify bucket exists
docker compose exec minio-setup mc ls myminio/papermark-documents

# Recreate bucket
docker compose up -d minio-setup
```

#### 3. Application Won't Start

**Symptom**: Papermark container keeps restarting

**Solution**:
```bash
# Check application logs
docker compose logs papermark

# Common fixes:
# 1. Verify all required environment variables are set
cat .env

# 2. Ensure database migrations completed
docker compose exec papermark npx prisma migrate deploy

# 3. Rebuild the application
docker compose up -d --build papermark
```

#### 4. SSL Certificate Issues

**Symptom**: "Certificate not found" or "Invalid certificate"

**Solution**:
```bash
# Check certificate files exist
ls -la nginx/certbot/conf/live/your-domain.com/

# Regenerate certificate
docker compose run --rm certbot certonly \
  --standalone \
  -d your-domain.com \
  --force-renewal

# Restart Nginx
docker compose restart nginx
```

### Viewing Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f papermark
docker compose logs -f postgres
docker compose logs -f minio
docker compose logs -f redis
docker compose logs -f nginx

# Last 100 lines
docker compose logs --tail=100 papermark
```

### Checking Service Health

```bash
# View all running services
docker compose ps

# Check specific service health
docker compose exec papermark wget -O- http://localhost:3000/api/health
docker compose exec postgres pg_isready -U papermark
docker compose exec redis redis-cli -a $REDIS_PASSWORD ping
```

## Advanced Configuration

### Custom Domain Configuration

If using custom domains for document sharing:

1. Add DNS records pointing to your server
2. Update Nginx config to handle multiple domains
3. Configure environment variables:

```bash
# In .env
VERCEL_ENV=production
PROJECT_ID_VERCEL=your-project-id
TEAM_ID_VERCEL=your-team-id
AUTH_BEARER_TOKEN=your-bearer-token
```

### Scaling and Performance

#### Increasing Resources

Edit `docker-compose.yml` to add resource limits:

```yaml
papermark:
  deploy:
    resources:
      limits:
        cpus: '2'
        memory: 4G
      reservations:
        cpus: '1'
        memory: 2G
```

#### Using External PostgreSQL

If you have an existing PostgreSQL instance:

1. Comment out the `postgres` service in `docker-compose.yml`
2. Update the connection strings in `.env`:

```bash
POSTGRES_PRISMA_URL=postgresql://user:password@external-host:5432/papermark?schema=public&pgbouncer=true&connection_limit=10
POSTGRES_PRISMA_URL_NON_POOLING=postgresql://user:password@external-host:5432/papermark?schema=public
```

#### Using External S3

To use AWS S3 instead of MinIO:

1. Comment out `minio` and `minio-setup` services in `docker-compose.yml`
2. Update storage configuration in `.env`:

```bash
NEXT_PUBLIC_UPLOAD_TRANSPORT=s3
NEXT_PRIVATE_UPLOAD_DISTRIBUTION_HOST=bucket-name.s3.region.amazonaws.com
NEXT_PRIVATE_UPLOAD_REGION=us-east-1
NEXT_PRIVATE_UPLOAD_BUCKET=your-bucket-name
NEXT_PRIVATE_UPLOAD_ACCESS_KEY_ID=AKIAxxxxx
NEXT_PRIVATE_UPLOAD_SECRET_ACCESS_KEY=xxxxx
```

### Monitoring

#### Health Check Endpoint

The application exposes a health check at `/api/health`. You can monitor it with:

```bash
# Create a simple monitoring script
cat > check-health.sh << 'EOF'
#!/bin/bash
if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
  echo "✓ Papermark is healthy"
else
  echo "✗ Papermark is down!"
  # Add alerting here (email, Slack, etc.)
fi
EOF

chmod +x check-health.sh

# Add to crontab for every 5 minutes
*/5 * * * * /path/to/papermark/check-health.sh
```

### Updating Papermark

```bash
# 1. Backup your data
./docker/backup.sh

# 2. Pull latest code
git pull origin main

# 3. Rebuild and restart
docker compose down
docker compose up -d --build

# 4. Run migrations
docker compose exec papermark npx prisma migrate deploy
```

## Security Best Practices

1. **Change all default passwords** in `.env`
2. **Use strong secrets** (32+ characters) for `NEXTAUTH_SECRET` and `DOCUMENT_PASSWORD_KEY`
3. **Enable SSL/HTTPS** for production deployments
4. **Restrict port access** - Only expose ports 80 and 443 publicly
5. **Regular backups** - Set up automated daily backups
6. **Keep updated** - Regularly update Docker images and Papermark code
7. **Monitor logs** - Check logs regularly for suspicious activity
8. **Use firewall** - Configure UFW or iptables to restrict access

```bash
# Example UFW rules
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw enable
```

## Getting Help

- **Documentation**: https://docs.papermark.io
- **GitHub Issues**: https://github.com/mfts/papermark/issues
- **Community**: https://github.com/mfts/papermark/discussions

## License Considerations

For **personal use**, Papermark is free to self-host.

For **commercial/team use**, a self-hosting license is required ($500+/month). Features like datarooms and advanced security require a license.

Visit [papermark.io/pricing](https://www.papermark.io/pricing) for licensing details.
