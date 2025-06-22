#!/bin/bash

# Pelnora Jewellers - Hiox Cloud Deployment Script
# Run this script on your Hiox cloud server

set -e  # Exit on any error

echo "🚀 Starting Pelnora Jewellers deployment on Hiox Cloud..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    print_error "Please run this script as root"
    exit 1
fi

print_status "Updating system packages..."
apt-get update

# Install Node.js if not present
if ! command -v node &> /dev/null; then
    print_status "Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
else
    print_status "Node.js is already installed: $(node --version)"
fi

# Install Git if not present
if ! command -v git &> /dev/null; then
    print_status "Installing Git..."
    apt-get install -y git
else
    print_status "Git is already installed: $(git --version)"
fi

# Install PostgreSQL if not present
if ! command -v psql &> /dev/null; then
    print_status "Installing PostgreSQL..."
    apt-get install -y postgresql postgresql-contrib
    systemctl start postgresql
    systemctl enable postgresql
else
    print_status "PostgreSQL is already installed"
fi

# Install PM2 globally
if ! command -v pm2 &> /dev/null; then
    print_status "Installing PM2..."
    npm install -g pm2
else
    print_status "PM2 is already installed: $(pm2 --version)"
fi

# Install Nginx if not present
if ! command -v nginx &> /dev/null; then
    print_status "Installing Nginx..."
    apt-get install -y nginx
    systemctl enable nginx
else
    print_status "Nginx is already installed"
fi

# Create application directory
APP_DIR="/var/www/html/pelnora"
print_status "Creating application directory: $APP_DIR"
mkdir -p $APP_DIR
cd $APP_DIR

# Setup PostgreSQL database
print_status "Setting up PostgreSQL database..."
DB_NAME="pelnora_db"
DB_USER="pelnora_user"
DB_PASSWORD="Pelnora@2024#Secure"

# Create database and user
sudo -u postgres psql -c "CREATE DATABASE $DB_NAME;" 2>/dev/null || print_warning "Database $DB_NAME might already exist"
sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';" 2>/dev/null || print_warning "User $DB_USER might already exist"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"
sudo -u postgres psql -c "ALTER USER $DB_USER CREATEDB;"

print_status "Database setup completed"

# Create environment file
print_status "Creating environment configuration..."
cat > .env << EOF
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME
JWT_SECRET=$(openssl rand -base64 32)
ADMIN_EMAIL=admin@pelnora.com
ADMIN_PASSWORD=Admin@2024#Secure
CORS_ORIGIN=http://103.235.106.35,https://103.235.106.35
EOF

print_status "Environment file created"

# Create a basic package.json if project files aren't uploaded yet
if [ ! -f "package.json" ]; then
    print_warning "Project files not found. Creating placeholder structure..."
    cat > package.json << EOF
{
  "name": "pelnora-jewellers",
  "version": "1.0.0",
  "description": "Pelnora Jewellers MLM Platform",
  "main": "server/index.js",
  "scripts": {
    "start": "node server/index.js",
    "dev": "cross-env NODE_ENV=development tsx server/index.ts",
    "build": "npm run build:client",
    "build:client": "cd client && npm run build",
    "migrate": "node migrate.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "pg": "^8.11.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.0",
    "cors": "^2.8.5",
    "dotenv": "^16.0.3"
  }
}
EOF

    mkdir -p server client
    
    # Create a basic server file
    cat > server/index.js << EOF
const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client/dist')));

// Basic route
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Pelnora Jewellers API is running' });
});

// Serve React app
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

app.listen(PORT, () => {
    console.log(\`Server running on port \${PORT}\`);
});
EOF

    # Create basic client structure
    mkdir -p client/dist
    cat > client/dist/index.html << EOF
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pelnora Jewellers</title>
    <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
        .container { max-width: 600px; margin: 0 auto; }
        .logo { font-size: 2.5em; color: #d4af37; margin-bottom: 20px; }
        .message { font-size: 1.2em; color: #333; }
    </style>
</head>
<body>
    <div class="container">
        <h1 class="logo">PELNORA JEWELLERS</h1>
        <p class="message">Welcome to Pelnora Jewellers MLM Platform</p>
        <p>The application is successfully deployed and running!</p>
        <p>Please upload your project files to complete the setup.</p>
    </div>
</body>
</html>
EOF

    print_warning "Placeholder files created. Please upload your actual project files."
fi

# Install dependencies if package.json exists
if [ -f "package.json" ]; then
    print_status "Installing application dependencies..."
    npm install
fi

# Setup Nginx configuration
print_status "Configuring Nginx..."
cat > /etc/nginx/sites-available/pelnora << EOF
server {
    listen 80;
    server_name 103.235.106.35;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Enable the site
ln -sf /etc/nginx/sites-available/pelnora /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
nginx -t

# Restart Nginx
systemctl restart nginx

print_status "Nginx configured and restarted"

# Start the application with PM2
print_status "Starting application with PM2..."
cd $APP_DIR

# Stop existing PM2 processes
pm2 delete pelnora-app 2>/dev/null || true

# Start the application
pm2 start server/index.js --name "pelnora-app" --env production

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup systemd -u root --hp /root

print_status "Application started with PM2"

# Setup firewall
print_status "Configuring firewall..."
ufw --force enable
ufw allow 22
ufw allow 80
ufw allow 443
ufw allow 2624

print_status "Firewall configured"

# Display status
print_status "Checking application status..."
pm2 status

print_status "Checking if application is responding..."
sleep 5
curl -f http://localhost:3000/api/health || print_warning "Application might not be responding yet"

echo ""
echo "🎉 Deployment completed successfully!"
echo ""
echo "📋 Deployment Summary:"
echo "   • Application Directory: $APP_DIR"
echo "   • Database: $DB_NAME"
echo "   • Database User: $DB_USER"
echo "   • Application URL: http://103.235.106.35"
echo "   • PM2 Process: pelnora-app"
echo ""
echo "📝 Next Steps:"
echo "   1. Upload your project files to: $APP_DIR"
echo "   2. Run: cd $APP_DIR && npm install"
echo "   3. Run: pm2 restart pelnora-app"
echo "   4. Check logs: pm2 logs pelnora-app"
echo ""
echo "🔧 Useful Commands:"
echo "   • Check status: pm2 status"
echo "   • View logs: pm2 logs pelnora-app"
echo "   • Restart app: pm2 restart pelnora-app"
echo "   • Check Nginx: systemctl status nginx"
echo ""
EOF
