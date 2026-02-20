#!/bin/bash
# macOS/Linux deployment script for Cloudflare

set -e

echo "============================================"
echo "Multitrack Player - Deploy to Cloudflare"
echo "============================================"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

echo ""
echo "Step 1: Deploying Worker (API)..."
npx wrangler deploy

echo ""
echo "Step 2: Deploying Pages (Frontend)..."
npx wrangler pages deploy frontend --project-name=multitrack-player

echo ""
echo "============================================"
echo "✅ Deployment complete!"
echo "============================================"
echo ""
echo "Your app will be available at:"
echo "  API: https://multitrack-api.YOUR_SUBDOMAIN.workers.dev"
echo "  Site: https://multitrack-player.pages.dev"
echo ""
