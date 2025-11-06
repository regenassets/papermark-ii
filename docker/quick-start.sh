#!/bin/bash
# Papermark Quick Start Script
# This script helps you set up Papermark self-hosted instance quickly

set -e

echo "======================================"
echo "Papermark Self-Hosting Quick Start"
echo "======================================"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "Error: Docker is not installed. Please install Docker first."
    echo "Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! docker compose version &> /dev/null; then
    echo "Error: Docker Compose is not installed or too old."
    echo "Please install Docker Compose v2.0 or higher."
    exit 1
fi

echo "✓ Docker and Docker Compose are installed"
echo ""

# Check if .env exists
if [ -f .env ]; then
    echo "Warning: .env file already exists."
    read -p "Do you want to overwrite it? (yes/no): " overwrite
    if [ "$overwrite" != "yes" ]; then
        echo "Keeping existing .env file."
    else
        rm .env
        create_env=true
    fi
else
    create_env=true
fi

# Create .env file
if [ "$create_env" = true ]; then
    echo "Creating .env file..."
    cp .env.docker .env

    # Generate secrets
    NEXTAUTH_SECRET=$(openssl rand -base64 32)
    DOCUMENT_PASSWORD_KEY=$(openssl rand -base64 32)
    POSTGRES_PASSWORD=$(openssl rand -base64 16)
    MINIO_ROOT_PASSWORD=$(openssl rand -base64 16)

    # Update .env with generated secrets
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s|NEXTAUTH_SECRET=.*|NEXTAUTH_SECRET=$NEXTAUTH_SECRET|" .env
        sed -i '' "s|DOCUMENT_PASSWORD_KEY=.*|DOCUMENT_PASSWORD_KEY=$DOCUMENT_PASSWORD_KEY|" .env
        sed -i '' "s|POSTGRES_PASSWORD=.*|POSTGRES_PASSWORD=$POSTGRES_PASSWORD|" .env
        sed -i '' "s|MINIO_ROOT_PASSWORD=.*|MINIO_ROOT_PASSWORD=$MINIO_ROOT_PASSWORD|" .env
    else
        # Linux
        sed -i "s|NEXTAUTH_SECRET=.*|NEXTAUTH_SECRET=$NEXTAUTH_SECRET|" .env
        sed -i "s|DOCUMENT_PASSWORD_KEY=.*|DOCUMENT_PASSWORD_KEY=$DOCUMENT_PASSWORD_KEY|" .env
        sed -i "s|POSTGRES_PASSWORD=.*|POSTGRES_PASSWORD=$POSTGRES_PASSWORD|" .env
        sed -i "s|MINIO_ROOT_PASSWORD=.*|MINIO_ROOT_PASSWORD=$MINIO_ROOT_PASSWORD|" .env
    fi

    echo "✓ Generated secure passwords and secrets"
fi

echo ""
echo "Configuration:"
read -p "Enter your domain name (or press Enter for localhost): " domain
if [ -z "$domain" ]; then
    domain="localhost"
fi

if [ "$domain" = "localhost" ]; then
    NEXTAUTH_URL="http://localhost:3000"
    BASE_URL="http://localhost:3000"
    APP_HOST="localhost"
    MINIO_ENDPOINT="localhost:9000"
else
    read -p "Will you use HTTPS? (yes/no): " use_https
    if [ "$use_https" = "yes" ]; then
        protocol="https"
    else
        protocol="http"
    fi
    NEXTAUTH_URL="$protocol://$domain"
    BASE_URL="$protocol://$domain"
    APP_HOST="$domain"
    MINIO_ENDPOINT="$domain:9000"
fi

# Update URLs in .env
if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' "s|NEXTAUTH_URL=.*|NEXTAUTH_URL=$NEXTAUTH_URL|" .env
    sed -i '' "s|NEXT_PUBLIC_BASE_URL=.*|NEXT_PUBLIC_BASE_URL=$BASE_URL|" .env
    sed -i '' "s|NEXT_PUBLIC_MARKETING_URL=.*|NEXT_PUBLIC_MARKETING_URL=$BASE_URL|" .env
    sed -i '' "s|NEXT_PUBLIC_APP_BASE_HOST=.*|NEXT_PUBLIC_APP_BASE_HOST=$APP_HOST|" .env
    sed -i '' "s|MINIO_ENDPOINT=.*|MINIO_ENDPOINT=$MINIO_ENDPOINT|" .env
else
    sed -i "s|NEXTAUTH_URL=.*|NEXTAUTH_URL=$NEXTAUTH_URL|" .env
    sed -i "s|NEXT_PUBLIC_BASE_URL=.*|NEXT_PUBLIC_BASE_URL=$BASE_URL|" .env
    sed -i "s|NEXT_PUBLIC_MARKETING_URL=.*|NEXT_PUBLIC_MARKETING_URL=$BASE_URL|" .env
    sed -i "s|NEXT_PUBLIC_APP_BASE_HOST=.*|NEXT_PUBLIC_APP_BASE_HOST=$APP_HOST|" .env
    sed -i "s|MINIO_ENDPOINT=.*|MINIO_ENDPOINT=$MINIO_ENDPOINT|" .env
fi

echo "✓ Configuration updated"
echo ""

# Ask about Nginx
read -p "Do you want to use Nginx reverse proxy with SSL support? (recommended for production) (yes/no): " use_nginx

echo ""
echo "Starting Papermark..."

if [ "$use_nginx" = "yes" ]; then
    docker compose --profile with-nginx up -d
else
    docker compose up -d
fi

echo ""
echo "======================================"
echo "Papermark is starting up!"
echo "======================================"
echo ""
echo "Access URLs:"
if [ "$use_nginx" = "yes" ]; then
    echo "  - Papermark: http://$domain (configure SSL separately)"
else
    echo "  - Papermark: $BASE_URL"
fi
echo "  - MinIO Console: http://$APP_HOST:9001"
echo ""
echo "Default MinIO credentials:"
echo "  - Username: papermark"
echo "  - Password: (check .env file for MINIO_ROOT_PASSWORD)"
echo ""
echo "Next steps:"
echo "  1. Wait for all services to start (1-2 minutes)"
echo "  2. Check status: docker compose ps"
echo "  3. View logs: docker compose logs -f papermark"
if [ "$use_nginx" = "yes" ]; then
    echo "  4. Configure SSL: See SELF_HOSTING.md for Let's Encrypt setup"
fi
echo "  5. Create your first account by visiting the application"
echo ""
echo "For detailed documentation, see: SELF_HOSTING.md"
echo ""
