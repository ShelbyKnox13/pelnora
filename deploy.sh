#!/bin/bash

# Pelnora Deployment Script with Version Control
# Usage: ./deploy.sh [version-tag]

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="pelnora"
DEPLOY_USER="your-username"  # Replace with your server username
SERVER_HOST="your-server.com"  # Replace with your server IP/domain
DEPLOY_PATH="/var/www/pelnora"  # Replace with your server path
BACKUP_PATH="/var/backups/pelnora"
PM2_APP_NAME="pelnora-app"

# Get version tag
VERSION_TAG=${1:-$(date +"%Y%m%d-%H%M%S")}

echo -e "${BLUE}🚀 Starting deployment of ${APP_NAME} v${VERSION_TAG}${NC}"

# Step 1: Pre-deployment checks
echo -e "${YELLOW}📋 Running pre-deployment checks...${NC}"

# Check if git is clean
if [[ -n $(git status --porcelain) ]]; then
    echo -e "${RED}❌ Git working directory is not clean. Please commit or stash changes.${NC}"
    exit 1
fi

# Check if we're on main/master branch
CURRENT_BRANCH=$(git branch --show-current)
if [[ "$CURRENT_BRANCH" != "main" && "$CURRENT_BRANCH" != "master" ]]; then
    echo -e "${YELLOW}⚠️  You're not on main/master branch. Current: $CURRENT_BRANCH${NC}"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Step 2: Create version tag
echo -e "${YELLOW}🏷️  Creating version tag: ${VERSION_TAG}${NC}"
git tag -a "v${VERSION_TAG}" -m "Release version ${VERSION_TAG}"

# Step 3: Build the application
echo -e "${YELLOW}🔨 Building application...${NC}"
npm run build

# Step 4: Create deployment package
echo -e "${YELLOW}📦 Creating deployment package...${NC}"
PACKAGE_NAME="${APP_NAME}-v${VERSION_TAG}.tar.gz"

# Create temporary directory for packaging
TEMP_DIR=$(mktemp -d)
cp -r . "$TEMP_DIR/${APP_NAME}"

# Remove unnecessary files from package
cd "$TEMP_DIR/${APP_NAME}"
rm -rf node_modules .git .vscode .idea
rm -f .env .env.local

# Create the package
cd "$TEMP_DIR"
tar -czf "$PACKAGE_NAME" "$APP_NAME"
mv "$PACKAGE_NAME" "$OLDPWD/"
cd "$OLDPWD"
rm -rf "$TEMP_DIR"

echo -e "${GREEN}✅ Package created: ${PACKAGE_NAME}${NC}"

# Step 5: Upload to server
echo -e "${YELLOW}📤 Uploading to server...${NC}"
scp "$PACKAGE_NAME" "${DEPLOY_USER}@${SERVER_HOST}:/tmp/"

# Step 6: Deploy on server
echo -e "${YELLOW}🚀 Deploying on server...${NC}"
ssh "${DEPLOY_USER}@${SERVER_HOST}" << EOF
    set -e
    
    # Create backup of current deployment
    if [ -d "${DEPLOY_PATH}" ]; then
        echo "Creating backup..."
        sudo mkdir -p ${BACKUP_PATH}
        sudo cp -r ${DEPLOY_PATH} ${BACKUP_PATH}/backup-\$(date +%Y%m%d-%H%M%S)
    fi
    
    # Extract new version
    cd /tmp
    tar -xzf ${PACKAGE_NAME}
    
    # Stop the application
    pm2 stop ${PM2_APP_NAME} || true
    
    # Replace old version with new
    sudo rm -rf ${DEPLOY_PATH}
    sudo mv ${APP_NAME} ${DEPLOY_PATH}
    sudo chown -R ${DEPLOY_USER}:${DEPLOY_USER} ${DEPLOY_PATH}
    
    # Install dependencies
    cd ${DEPLOY_PATH}
    npm ci --production
    
    # Copy environment file
    cp .env.example .env
    echo "⚠️  Don't forget to update .env file with production values!"
    
    # Start the application
    pm2 start ecosystem.config.js || pm2 start npm --name "${PM2_APP_NAME}" -- start
    pm2 save
    
    # Cleanup
    rm -f /tmp/${PACKAGE_NAME}
    
    echo "✅ Deployment completed successfully!"
EOF

# Step 7: Cleanup local files
rm -f "$PACKAGE_NAME"

# Step 8: Push tags to remote
echo -e "${YELLOW}📤 Pushing tags to remote repository...${NC}"
git push origin "v${VERSION_TAG}"

echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo -e "${BLUE}📋 Deployment Summary:${NC}"
echo -e "   Version: v${VERSION_TAG}"
echo -e "   Server: ${SERVER_HOST}"
echo -e "   Path: ${DEPLOY_PATH}"
echo -e "   Backup: ${BACKUP_PATH}/backup-*"
echo -e "${YELLOW}⚠️  Remember to update the .env file on the server with production values!${NC}"
EOF