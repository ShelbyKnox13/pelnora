# Pelnora Deployment Guide

This guide covers deploying the Pelnora application with version control and rollback capabilities.

## 🚀 Quick Start

### Prerequisites

1. **Server Requirements:**
   - Ubuntu/Debian Linux server
   - Node.js 18+ installed
   - PM2 installed globally (`npm install -g pm2`)
   - PostgreSQL database
   - SSH access to server

2. **Local Requirements:**
   - Git installed
   - SSH key configured for server access
   - Bash shell (Git Bash on Windows)

### Initial Setup

1. **Configure deployment scripts:**
   ```bash
   # Edit deploy.sh
   DEPLOY_USER="your-username"        # Your server username
   SERVER_HOST="your-server.com"      # Your server IP/domain
   DEPLOY_PATH="/var/www/pelnora"     # Deployment path on server
   
   # Edit ecosystem.config.js
   # Update user, host, and repo URL
   ```

2. **Make scripts executable:**
   ```bash
   chmod +x deploy.sh rollback.sh health-check.sh
   ```

3. **Set up environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your production values
   ```

## 📦 Deployment Process

### Method 1: Automated Deployment

```bash
# Deploy with auto-generated version
npm run deploy

# Deploy with specific version
./deploy.sh v1.2.3
```

### Method 2: Manual Steps

1. **Commit your changes:**
   ```bash
   git add .
   git commit -m "Your commit message"
   git push origin main
   ```

2. **Create version tag:**
   ```bash
   git tag -a v1.0.0 -m "Release version 1.0.0"
   git push origin v1.0.0
   ```

3. **Build and deploy:**
   ```bash
   npm run build
   ./deploy.sh v1.0.0
   ```

## 🔄 Version Control & Rollbacks

### List Available Versions
```bash
git tag -l
```

### Rollback to Previous Version
```bash
# List available backups
npm run rollback

# Rollback to specific backup
./rollback.sh backup-20231215-143022
```

### Emergency Rollback
```bash
# Quick rollback to last backup
ssh user@server "cd /var/www/pelnora && pm2 stop pelnora-app && cp -r /var/backups/pelnora/backup-* . && pm2 start pelnora-app"
```

## 🏥 Health Monitoring

### Check Application Health
```bash
npm run health
```

### Monitor Logs
```bash
npm run logs        # View live logs
npm run status      # Check PM2 status
```

### Manual Health Checks
```bash
# Check if app is responding
curl https://your-server.com/api/health

# Check PM2 status
pm2 status

# Check server resources
htop
df -h
```

## 🛠️ Server Management

### Start/Stop Application
```bash
npm run start:prod  # Start with PM2
npm run stop        # Stop application
npm run restart     # Restart application
```

### Database Operations
```bash
# Push schema changes
npm run db:push

# Backup database
pg_dump pelnora_db > backup.sql

# Restore database
psql pelnora_db < backup.sql
```

## 📁 Directory Structure on Server

```
/var/www/pelnora/           # Main application
├── server/                 # Backend code
├── client/                 # Frontend code
├── dist/                   # Built application
├── logs/                   # Application logs
├── .env                    # Environment variables
└── ecosystem.config.js     # PM2 configuration

/var/backups/pelnora/       # Backups
├── backup-20231215-143022/ # Timestamped backups
├── backup-20231214-120000/
└── pre-rollback-*/         # Pre-rollback backups
```

## 🔧 Configuration Files

### Environment Variables (.env)
```bash
DATABASE_URL=postgresql://user:pass@localhost:5432/pelnora_db
PORT=3000
NODE_ENV=production
SESSION_SECRET=your-super-secret-key
```

### PM2 Configuration (ecosystem.config.js)
- Cluster mode for high availability
- Auto-restart on crashes
- Log rotation
- Memory limit monitoring

## 🚨 Troubleshooting

### Common Issues

1. **Deployment fails:**
   ```bash
   # Check server connectivity
   ping your-server.com
   ssh user@your-server.com
   ```

2. **Application won't start:**
   ```bash
   # Check logs
   npm run logs
   
   # Check PM2 status
   npm run status
   
   # Restart application
   npm run restart
   ```

3. **Database connection issues:**
   ```bash
   # Test database connection
   psql -h localhost -U username -d pelnora_db
   
   # Check environment variables
   cat .env
   ```

4. **Permission issues:**
   ```bash
   # Fix ownership
   sudo chown -R user:user /var/www/pelnora
   
   # Fix permissions
   chmod +x deploy.sh rollback.sh health-check.sh
   ```

### Emergency Procedures

1. **Complete system failure:**
   ```bash
   # Rollback to last known good version
   ./rollback.sh backup-YYYYMMDD-HHMMSS
   ```

2. **Database corruption:**
   ```bash
   # Restore from backup
   psql pelnora_db < /var/backups/db/latest.sql
   ```

3. **Server resource issues:**
   ```bash
   # Free up space
   pm2 flush  # Clear logs
   npm cache clean --force
   
   # Restart services
   sudo systemctl restart postgresql
   npm run restart
   ```

## 📊 Monitoring & Alerts

### Set up monitoring:
1. **PM2 Monitoring:**
   ```bash
   pm2 install pm2-server-monit
   ```

2. **Log Monitoring:**
   ```bash
   # Set up log rotation
   pm2 install pm2-logrotate
   ```

3. **Health Check Cron:**
   ```bash
   # Add to crontab
   */5 * * * * /path/to/health-check.sh
   ```

## 🔐 Security Considerations

1. **Environment Variables:**
   - Never commit .env files
   - Use strong passwords
   - Rotate secrets regularly

2. **Server Security:**
   - Keep system updated
   - Use SSH keys only
   - Configure firewall
   - Regular security audits

3. **Application Security:**
   - Regular dependency updates
   - Security headers
   - Rate limiting
   - Input validation

## 📞 Support

For deployment issues:
1. Check logs: `npm run logs`
2. Run health check: `npm run health`
3. Review this documentation
4. Contact system administrator

---

**Last Updated:** December 2024
**Version:** 1.0.0