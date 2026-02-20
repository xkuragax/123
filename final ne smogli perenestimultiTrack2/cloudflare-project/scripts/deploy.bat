@echo off
REM Windows deployment script for Cloudflare

echo ============================================
echo Multitrack Player - Deploy to Cloudflare
echo ============================================
echo.

REM Check if node_modules exists
if not exist node_modules (
    echo Installing dependencies...
    call npm install
)

echo.
echo Step 1: Deploying Worker (API)...
call npx wrangler deploy

echo.
echo Step 2: Deploying Pages (Frontend)...
call npx wrangler pages deploy frontend --project-name=multitrack-player

echo.
echo ============================================
echo Deployment complete!
echo ============================================
echo.
echo Your app will be available at:
echo   API: https://multitrack-api.YOUR_SUBDOMAIN.workers.dev
echo   Site: https://multitrack-player.pages.dev
echo.
pause
