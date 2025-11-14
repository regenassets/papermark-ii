#!/bin/bash
# Complete Docker cache clear and rebuild script
# Nuclear option to force Docker to rebuild from scratch

set -e

echo "==============================================="
echo "Papermark Docker - NUCLEAR Cache Clear"
echo "==============================================="
echo ""
echo "WARNING: This will remove ALL Docker images and cached layers"
echo "Press Ctrl+C within 5 seconds to cancel..."
sleep 5

echo ""
echo "Step 1: Stopping all containers..."
docker compose down -v

echo ""
echo "Step 2: Removing ALL Docker containers, images, and build cache..."
docker system prune -a -f --volumes

echo ""
echo "Step 3: Removing buildx cache..."
docker buildx prune -af

echo ""
echo "Step 4: Verify Node 20 in Dockerfile..."
grep "FROM node" Dockerfile
echo ""

echo "Step 5: Pulling Node 20 base image fresh..."
docker pull node:20-alpine

echo ""
echo "Step 6: Building from absolute scratch (no cache)..."
DOCKER_BUILDKIT=1 docker compose build --no-cache --pull

echo ""
echo "Step 7: Starting services..."
docker compose up -d

echo ""
echo "==============================================="
echo "Build Complete!"
echo "==============================================="
echo ""
echo "Monitor logs with: docker compose logs -f papermark"
echo "Access app at: http://localhost:3000"
echo ""
