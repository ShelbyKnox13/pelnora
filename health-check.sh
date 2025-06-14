#!/bin/bash

# Pelnora Health Check Script
# Usage: ./health-check.sh

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
SERVER_HOST="your-server.com"  # Replace with your server IP/domain
APP_URL="https://your-server.com"  # Replace with your app URL
PM2_APP_NAME="pelnora-app"

echo -e "${BLUE}🏥 Running health checks for Pelnora...${NC}"

# Check 1: Server connectivity
echo -e "${YELLOW}🔌 Checking server connectivity...${NC}"
if ping -c 1 "$SERVER_HOST" &> /dev/null; then
    echo -e "${GREEN}✅ Server is reachable${NC}"
else
    echo -e "${RED}❌ Server is not reachable${NC}"
    exit 1
fi

# Check 2: Application response
echo -e "${YELLOW}🌐 Checking application response...${NC}"
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$APP_URL" || echo "000")
if [ "$HTTP_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ Application is responding (HTTP $HTTP_STATUS)${NC}"
elif [ "$HTTP_STATUS" = "000" ]; then
    echo -e "${RED}❌ Application is not responding (Connection failed)${NC}"
else
    echo -e "${YELLOW}⚠️  Application responded with HTTP $HTTP_STATUS${NC}"
fi

# Check 3: PM2 process status
echo -e "${YELLOW}⚙️  Checking PM2 process status...${NC}"
ssh "${DEPLOY_USER}@${SERVER_HOST}" << EOF
    PM2_STATUS=\$(pm2 jlist | jq -r '.[] | select(.name=="$PM2_APP_NAME") | .pm2_env.status' 2>/dev/null || echo "not_found")
    
    if [ "\$PM2_STATUS" = "online" ]; then
        echo "✅ PM2 process is online"
        pm2 show $PM2_APP_NAME
    elif [ "\$PM2_STATUS" = "not_found" ]; then
        echo "❌ PM2 process not found"
    else
        echo "⚠️  PM2 process status: \$PM2_STATUS"
        pm2 show $PM2_APP_NAME
    fi
EOF

# Check 4: Database connectivity (if applicable)
echo -e "${YELLOW}🗄️  Checking database connectivity...${NC}"
HEALTH_CHECK_URL="$APP_URL/api/health"
DB_STATUS=$(curl -s "$HEALTH_CHECK_URL" | jq -r '.database' 2>/dev/null || echo "unknown")
if [ "$DB_STATUS" = "connected" ]; then
    echo -e "${GREEN}✅ Database is connected${NC}"
else
    echo -e "${RED}❌ Database connection issue${NC}"
fi

# Check 5: Disk space
echo -e "${YELLOW}💾 Checking disk space...${NC}"
ssh "${DEPLOY_USER}@${SERVER_HOST}" << EOF
    DISK_USAGE=\$(df -h /var/www | awk 'NR==2 {print \$5}' | sed 's/%//')
    if [ "\$DISK_USAGE" -lt 80 ]; then
        echo "✅ Disk usage: \${DISK_USAGE}% (OK)"
    elif [ "\$DISK_USAGE" -lt 90 ]; then
        echo "⚠️  Disk usage: \${DISK_USAGE}% (Warning)"
    else
        echo "❌ Disk usage: \${DISK_USAGE}% (Critical)"
    fi
EOF

# Check 6: Memory usage
echo -e "${YELLOW}🧠 Checking memory usage...${NC}"
ssh "${DEPLOY_USER}@${SERVER_HOST}" << EOF
    MEMORY_USAGE=\$(free | awk 'NR==2{printf "%.0f", \$3*100/\$2}')
    if [ "\$MEMORY_USAGE" -lt 80 ]; then
        echo "✅ Memory usage: \${MEMORY_USAGE}% (OK)"
    elif [ "\$MEMORY_USAGE" -lt 90 ]; then
        echo "⚠️  Memory usage: \${MEMORY_USAGE}% (Warning)"
    else
        echo "❌ Memory usage: \${MEMORY_USAGE}% (Critical)"
    fi
EOF

echo -e "${BLUE}🏥 Health check completed!${NC}"