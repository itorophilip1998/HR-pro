#!/bin/bash

# Hr-Pro - Docker Starter Script
# This script starts all Docker services for the application

echo "🚀 Starting Hr-Pro Application..."
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker is not running. Please start Docker Desktop first."
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Error: docker-compose is not installed."
    exit 1
fi

echo "📦 Building and starting containers..."
docker-compose up -d --build

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 5

echo ""
echo "✅ Services started successfully!"
echo ""
echo "📍 Access the application at:"
echo "   Frontend:    http://localhost:3001"
echo "   Backend API: http://localhost:8001"
echo "   pgAdmin:     http://localhost:5050"
echo ""
echo "📊 Database credentials:"
echo "   Host:     postgres"
echo "   Port:     5432"
echo "   Database: hr_pro"
echo "   Username: postgres"
echo "   Password: postgres"
echo ""
echo "🔐 pgAdmin credentials:"
echo "   Email:    admin@admin.com"
echo "   Password: admin"
echo ""
echo "📝 View logs: docker-compose logs -f"
echo "🛑 Stop services: docker-compose down"
echo ""

