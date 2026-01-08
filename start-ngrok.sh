#!/bin/bash

# Script to start ngrok tunnel for Hr-Pro frontend
# Frontend runs on localhost:3001

echo "🚀 Starting ngrok tunnel for Hr-Pro frontend (localhost:3001)..."
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

# Check for static domain configuration
# You can set this environment variable for a permanent domain
# Example: export NGROK_DOMAIN="your-domain.ngrok-free.app"
if [ -n "$NGROK_DOMAIN" ]; then
    echo "✅ Using static domain: $NGROK_DOMAIN"
    echo "🔗 Permanent URL: https://$NGROK_DOMAIN"
    echo ""
    ngrok http 3001 --domain="$NGROK_DOMAIN"
else
    echo "ℹ️  Using dynamic ngrok URL (changes on restart)"
    echo "💡 For a permanent link, set NGROK_DOMAIN environment variable"
    echo "   Example: export NGROK_DOMAIN='your-domain.ngrok-free.app'"
    echo "   Then run: ./start-ngrok.sh"
    echo ""
    echo "✅ Starting ngrok tunnel..."
    echo "📱 Your public URL will be displayed below"
    echo "🔗 Access the frontend via the ngrok URL"
    echo "🌐 Ngrok web interface: http://localhost:4040"
    echo ""
    echo "Press Ctrl+C to stop ngrok"
    echo ""
    
    # Start ngrok with web interface on port 4040
    ngrok http 3001
fi

