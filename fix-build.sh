#!/bin/bash
# Complete Docker cache clear and rebuild script

echo "==============================================="
echo "Papermark Docker - Complete Cache Clear"
echo "==============================================="
echo ""

echo "Step 1: Stopping all containers..."
docker compose down -v

echo ""
echo "Step 2: Removing ALL Docker build cache..."
docker builder prune -af

echo ""
echo "Step 3: Removing old images..."
docker rmi $(docker images 'papermark*' -q) 2>/dev/null || echo "No papermark images to remove"
docker rmi node:18-alpine 2>/dev/null || echo "Node 18 image already removed or not present"

echo ""
echo "Step 4: Pulling Node 20 image explicitly..."
docker pull node:20-alpine

echo ""
echo "Step 5: Building with no cache..."
docker compose build --no-cache --pull

echo ""
echo "Step 6: Starting services..."
docker compose up -d

echo ""
echo "==============================================="
echo "Build Complete!"
echo "==============================================="
echo ""
echo "Monitor logs with: docker compose logs -f papermark"
echo "Access app at: http://localhost:3000"
echo ""
