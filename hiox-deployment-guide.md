# Pelnora Jewellers - Hiox Cloud Deployment Guide

## Server Details
- **Host**: 103.235.106.35
- **Port**: 2624
- **Username**: root
- **Password**: PmnSQeo@p]8y9%6E

## Step 1: Connect to Your Server

Open a terminal/command prompt and connect to your server:

```bash
ssh -p 2624 root@103.235.106.35
```

Enter the password when prompted: `PmnSQeo@p]8y9%6E`

## Step 2: Check Server Environment

Once connected, run these commands to check your server setup:

```bash
# Check current directory and files
pwd
ls -la

# Check if Node.js is installed
node --version
npm --version

# Check if Git is installed
which git

# Check if PostgreSQL is installed
which psql
systemctl status postgresql

# Check available space
df -h
```

## Step 3: Install Required Software (if needed)

If Node.js is not installed:
```bash
# Install Node.js (version 18 LTS)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

If Git is not installed:
```bash
apt-get update
apt-get install -y git
```

If PostgreSQL is not installed:
```bash
apt-get install -y postgresql postgresql-contrib
systemctl start postgresql
systemctl enable postgresql
```

## Step 4: Setup PostgreSQL Database

```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user (run these in PostgreSQL prompt)
CREATE DATABASE pelnora_db;
CREATE USER pelnora_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE pelnora_db TO pelnora_user;
\q
```

## Step 5: Clone and Deploy Application

```bash
# Navigate to web directory (adjust path as needed)
cd /var/www/html

# Clone your repository (you'll need to upload your code first)
# For now, create the directory structure
mkdir pelnora
cd pelnora

# You'll need to upload your project files here
# You can use SCP, SFTP, or Git to transfer files
```

## Step 6: Upload Project Files

From your local machine, upload the project files:

```bash
# Using SCP (run from your local machine)
scp -P 2624 -r . root@103.235.106.35:/var/www/html/pelnora/
```

## Step 7: Install Dependencies and Build

```bash
# Navigate to project directory
cd /var/www/html/pelnora

# Install dependencies
npm install

# Build the client
cd client
npm install
npm run build
cd ..

# Install server dependencies
cd server
npm install
cd ..
```

## Step 8: Setup Environment Variables

```bash
# Create environment file
nano .env
```

Add these environment variables:
```
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://pelnora_user:your_secure_password@localhost:5432/pelnora_db
JWT_SECRET=your_jwt_secret_here
ADMIN_EMAIL=admin@pelnora.com
ADMIN_PASSWORD=your_admin_password
```

## Step 9: Run Database Migrations

```bash
# Run migrations
npm run migrate
```

## Step 10: Setup Process Manager (PM2)

```bash
# Install PM2 globally
npm install -g pm2

# Start the application
pm2 start server/index.js --name "pelnora-app"

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

## Step 11: Setup Nginx (Web Server)

```bash
# Install Nginx
apt-get install -y nginx

# Create Nginx configuration
nano /etc/nginx/sites-available/pelnora
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:
```bash
# Enable the site
ln -s /etc/nginx/sites-available/pelnora /etc/nginx/sites-enabled/

# Test Nginx configuration
nginx -t

# Restart Nginx
systemctl restart nginx
systemctl enable nginx
```

## Step 12: Setup Firewall

```bash
# Allow necessary ports
ufw allow 22
ufw allow 80
ufw allow 443
ufw allow 2624
ufw enable
```

## Step 13: Verify Deployment

```bash
# Check if application is running
pm2 status

# Check application logs
pm2 logs pelnora-app

# Check if port 3000 is listening
netstat -tlnp | grep :3000

# Test the application
curl http://localhost:3000
```

## Troubleshooting

### If the application fails to start:
```bash
# Check logs
pm2 logs pelnora-app

# Check environment variables
cat .env

# Check database connection
psql -U pelnora_user -d pelnora_db -h localhost
```

### If database connection fails:
```bash
# Check PostgreSQL status
systemctl status postgresql

# Check if database exists
sudo -u postgres psql -l
```

### If Nginx fails:
```bash
# Check Nginx status
systemctl status nginx

# Check Nginx error logs
tail -f /var/log/nginx/error.log
```

## Security Recommendations

1. Change default PostgreSQL password
2. Setup SSL certificate (Let's Encrypt)
3. Configure proper firewall rules
4. Regular security updates
5. Setup automated backups

## Maintenance Commands

```bash
# Restart application
pm2 restart pelnora-app

# Update application (after code changes)
cd /var/www/html/pelnora
git pull
npm install
npm run build
pm2 restart pelnora-app

# Backup database
pg_dump -U pelnora_user -h localhost pelnora_db > backup_$(date +%Y%m%d).sql
