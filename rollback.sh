#!/bin/bash

# Pelnora Rollback Script
# Usage: ./rollback.sh [backup-name]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
DEPLOY_USER="your-username"  # Replace with your server username
SERVER_HOST="your-server.com"  # Replace with your server IP/domain
DEPLOY_PATH="/var/www/pelnora"
BACKUP_PATH="/var/backups/pelnora"
PM2_APP_NAME="pelnora-app"

echo -e "${BLUE}🔄 Starting rollback process...${NC}"

# List available backups if no specific backup is provided
if [ -z "$1" ]; then
    echo -e "${YELLOW}📋 Available backups:${NC}"
    ssh "${DEPLOY_USER}@${SERVER_HOST}" "ls -la ${BACKUP_PATH}/ | grep backup-"
    echo
    read -p "Enter backup name (e.g., backup-20231215-143022): " BACKUP_NAME
else
    BACKUP_NAME="$1"
fi

# Confirm rollback
echo -e "${YELLOW}⚠️  You are about to rollback to: ${BACKUP_NAME}${NC}"
read -p "Are you sure? This will replace the current deployment. (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}❌ Rollback cancelled.${NC}"
    exit 1
fi

# Perform rollback on server
echo -e "${YELLOW}🔄 Performing rollback...${NC}"
ssh "${DEPLOY_USER}@${SERVER_HOST}" << EOF
    set -e
    
    # Check if backup exists
    if [ ! -d "${BACKUP_PATH}/${BACKUP_NAME}" ]; then
        echo "❌ Backup ${BACKUP_NAME} not found!"
        exit 1
    fi
    
    # Create backup of current state before rollback
    echo "Creating backup of current state..."
    sudo cp -r ${DEPLOY_PATH} ${BACKUP_PATH}/pre-rollback-\$(date +%Y%m%d-%H%M%S)
    
    # Stop the application
    pm2 stop ${PM2_APP_NAME} || true
    
    # Restore from backup
    echo "Restoring from backup..."
    sudo rm -rf ${DEPLOY_PATH}
    sudo cp -r ${BACKUP_PATH}/${BACKUP_NAME} ${DEPLOY_PATH}
    sudo chown -R ${DEPLOY_USER}:${DEPLOY_USER} ${DEPLOY_PATH}
    
    # Install dependencies (in case they changed)
    cd ${DEPLOY_PATH}
    npm ci --production
    
    # Start the application
    pm2 start ${PM2_APP_NAME} || pm2 start ecosystem.config.js --env production
    
    echo "✅ Rollback completed successfully!"
EOF

echo -e "${GREEN}🎉 Rollback completed successfully!${NC}"
echo -e "${BLUE}📋 Rollback Summary:${NC}"
echo -e "   Restored from: ${BACKUP_NAME}"
echo -e "   Server: ${SERVER_HOST}"
echo -e "   Path: ${DEPLOY_PATH}"