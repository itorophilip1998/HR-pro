#!/bin/bash

# Script to start ngrok with permanent domain for Hr-Pro frontend

echo "🚀 Starting ngrok with permanent domain for Hr-Pro frontend..."
echo ""

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null; then
    echo "❌ Error: ngrok is not installed"
    echo "Install it from: https://ngrok.com/download"
    exit 1
fi

# Check if frontend is running
if ! curl -s http://localhost:3001 > /dev/null; then
    echo "⚠️  Warning: Frontend doesn't seem to be running on localhost:3001"
    echo "   Make sure to start the application first with: ./start.sh"
    echo ""
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Check if permanent domain is configured
CONFIG_FILE="/Users/itorophilip/Library/Application Support/ngrok/ngrok.yml"
if ! grep -q "hr-pro-frontend:" "$CONFIG_FILE" 2>/dev/null; then
    echo "❌ Error: Permanent domain not configured"
    echo "Run: ./setup-permanent-ngrok.sh to set up a permanent domain"
    exit 1
fi

DOMAIN=$(grep -A 3 "hr-pro-frontend:" "$CONFIG_FILE" | grep "domain:" | awk '{print $2}')

if [ -z "$DOMAIN" ]; then
    echo "❌ Error: Could not find domain in config"
    echo "Run: ./setup-permanent-ngrok.sh to set up a permanent domain"
    exit 1
fi

echo "✅ Using permanent domain: $DOMAIN"
echo "🔗 Permanent URL: https://$DOMAIN"
echo "🌐 Ngrok web interface: http://localhost:4040"
echo ""
echo "Press Ctrl+C to stop ngrok"
echo ""

# Start ngrok with permanent domain
ngrok start hr-pro-frontend

