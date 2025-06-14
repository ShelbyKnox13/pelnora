# Pelnora Deployment Script (PowerShell)
# Usage: .\deploy.ps1 [version-tag]

param(
    [string]$VersionTag = (Get-Date -Format "yyyyMMdd-HHmmss")
)

# Configuration - UPDATE THESE VALUES
$APP_NAME = "pelnora"
$DEPLOY_USER = "your-username"      # Replace with your server username
$SERVER_HOST = "your-server.com"    # Replace with your server IP/domain
$DEPLOY_PATH = "/var/www/pelnora"   # Replace with your server path
$BACKUP_PATH = "/var/backups/pelnora"
$PM2_APP_NAME = "pelnora-app"

Write-Host "🚀 Starting deployment of $APP_NAME v$VersionTag" -ForegroundColor Blue

# Step 1: Pre-deployment checks
Write-Host "📋 Running pre-deployment checks..." -ForegroundColor Yellow

# Check if git is clean
$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Host "❌ Git working directory is not clean. Please commit or stash changes." -ForegroundColor Red
    exit 1
}

# Check current branch
$currentBranch = git branch --show-current
if ($currentBranch -ne "main" -and $currentBranch -ne "master") {
    Write-Host "⚠️  You're not on main/master branch. Current: $currentBranch" -ForegroundColor Yellow
    $continue = Read-Host "Continue anyway? (y/N)"
    if ($continue -ne "y" -and $continue -ne "Y") {
        exit 1
    }
}

# Step 2: Create version tag
Write-Host "🏷️  Creating version tag: $VersionTag" -ForegroundColor Yellow
git tag -a "v$VersionTag" -m "Release version $VersionTag"

# Step 3: Build the application
Write-Host "🔨 Building application..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}

# Step 4: Create deployment package
Write-Host "📦 Creating deployment package..." -ForegroundColor Yellow
$packageName = "$APP_NAME-v$VersionTag.zip"

# Create temporary directory
$tempDir = New-TemporaryFile | ForEach-Object { Remove-Item $_; New-Item -ItemType Directory -Path $_ }
$appDir = Join-Path $tempDir $APP_NAME

# Copy files to temp directory
Copy-Item -Path "." -Destination $appDir -Recurse -Exclude @("node_modules", ".git", ".vscode", ".idea", ".env", ".env.local")

# Create the package
Compress-Archive -Path $appDir -DestinationPath $packageName -Force
Remove-Item -Path $tempDir -Recurse -Force

Write-Host "✅ Package created: $packageName" -ForegroundColor Green

# Step 5: Upload to server (using SCP via WSL or Git Bash)
Write-Host "📤 Uploading to server..." -ForegroundColor Yellow
Write-Host "Please run the following commands manually:" -ForegroundColor Cyan
Write-Host "scp $packageName ${DEPLOY_USER}@${SERVER_HOST}:/tmp/" -ForegroundColor White

# Step 6: Display server deployment commands
Write-Host "🚀 Run these commands on your server:" -ForegroundColor Yellow
Write-Host @"
# SSH to your server
ssh ${DEPLOY_USER}@${SERVER_HOST}

# Create backup
sudo mkdir -p ${BACKUP_PATH}
if [ -d "${DEPLOY_PATH}" ]; then
    sudo cp -r ${DEPLOY_PATH} ${BACKUP_PATH}/backup-$(date +%Y%m%d-%H%M%S)
fi

# Extract new version
cd /tmp
unzip ${packageName}

# Stop application
pm2 stop ${PM2_APP_NAME} || true

# Replace old version
sudo rm -rf ${DEPLOY_PATH}
sudo mv ${APP_NAME} ${DEPLOY_PATH}
sudo chown -R ${DEPLOY_USER}:${DEPLOY_USER} ${DEPLOY_PATH}

# Install dependencies
cd ${DEPLOY_PATH}
npm ci --production

# Update environment file
cp .env.example .env
# Edit .env with production values

# Start application
pm2 start ecosystem.config.js --env production
pm2 save

# Cleanup
rm -f /tmp/${packageName}
"@ -ForegroundColor White

# Step 7: Push tags to remote
Write-Host "📤 Pushing tags to remote repository..." -ForegroundColor Yellow
git push origin "v$VersionTag"

Write-Host "🎉 Deployment package ready!" -ForegroundColor Green
Write-Host "📋 Deployment Summary:" -ForegroundColor Blue
Write-Host "   Version: v$VersionTag"
Write-Host "   Package: $packageName"
Write-Host "   Server: $SERVER_HOST"
Write-Host "   Path: $DEPLOY_PATH"
Write-Host "⚠️  Remember to update the .env file on the server with production values!" -ForegroundColor Yellow

# Cleanup
Remove-Item -Path $packageName -Force