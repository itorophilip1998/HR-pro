#!/bin/bash

# Script to set up permanent ngrok domain for Hr-Pro
# This requires an ngrok paid plan with a reserved domain

echo "🔗 Setting up permanent ngrok link for Hr-Pro"
echo ""

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null; then
    echo "❌ Error: ngrok is not installed"
    echo "Install it from: https://ngrok.com/download"
    exit 1
fi

echo "To get a permanent ngrok link, you need:"
echo "1. An ngrok account (you already have one)"
echo "2. A paid ngrok plan ($8/month) OR a free reserved domain"
echo "3. A reserved domain from: https://dashboard.ngrok.com/cloud-edge/domains"
echo ""
echo "Steps:"
echo "1. Go to: https://dashboard.ngrok.com/cloud-edge/domains"
echo "2. Reserve a domain (e.g., hr-pro.ngrok-free.app)"
echo "3. Copy the domain name"
echo ""

read -p "Enter your reserved ngrok domain (e.g., hr-pro.ngrok-free.app): " DOMAIN

if [ -z "$DOMAIN" ]; then
    echo "❌ Error: Domain is required"
    exit 1
fi

# Get authtoken from config
AUTHTOKEN=$(grep "authtoken:" "/Users/itorophilip/Library/Application Support/ngrok/ngrok.yml" 2>/dev/null | awk '{print $2}')

if [ -z "$AUTHTOKEN" ]; then
    echo "⚠️  Warning: Could not find authtoken in config"
    echo "Please run: ngrok config add-authtoken YOUR_TOKEN"
    exit 1
fi

# Create ngrok config for permanent domain
CONFIG_FILE="/Users/itorophilip/Library/Application Support/ngrok/ngrok.yml"

# Backup existing config
if [ -f "$CONFIG_FILE" ]; then
    cp "$CONFIG_FILE" "$CONFIG_FILE.backup"
    echo "✅ Backed up existing config to $CONFIG_FILE.backup"
fi

# Create new config with permanent domain
cat > "$CONFIG_FILE" << EOF
version: "2"
authtoken: $AUTHTOKEN

tunnels:
  hr-pro-frontend:
    proto: http
    addr: 3001
    domain: $DOMAIN
    inspect: true
EOF

echo ""
echo "✅ Configuration updated!"
echo "🔗 Permanent URL: https://$DOMAIN"
echo ""
echo "To start ngrok with permanent domain, run:"
echo "  ngrok start hr-pro-frontend"
echo ""
echo "Or use the script:"
echo "  ./start-ngrok-permanent.sh"
echo ""

