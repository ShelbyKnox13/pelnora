# Pelnora MLM Application - cPanel Deployment Guide

This guide will help you deploy the Pelnora MLM application on a cPanel shared hosting environment.

## Prerequisites

1. A cPanel hosting account with:
   - Node.js support (version 18.x or higher)
   - MySQL database
   - SSH access (recommended for troubleshooting)

## Installation Steps

### 1. Upload Files

Upload all the files in this package to your cPanel hosting account using File Manager or FTP.

### 2. Create a MySQL Database

1. Log in to your cPanel account
2. Go to MySQL Databases
3. Create a new database (e.g., `your_username_pelnora`)
4. Create a new database user with a strong password
5. Add the user to the database with ALL PRIVILEGES

### 3. Configure Environment Variables

1. Rename `.env.example` to `.env`
2. Update the database credentials and other settings in the `.env` file:
   ```
   DB_HOST=127.0.0.1
   DB_USER=your_cpanel_db_username
   DB_PASSWORD=your_cpanel_db_password
   DB_NAME=your_cpanel_db_name
   ```

### 4. Install Dependencies

Connect to your server via SSH and run:

```bash
cd /path/to/your/application
npm install
```

If SSH access is not available, you can use cPanel's Setup Node.js App feature to install dependencies.

### 5. Set Up Node.js Application

1. In cPanel, go to "Setup Node.js App"
2. Create a new Node.js application:
   - Application mode: Production
   - Node.js version: 18.x (or higher)
   - Application root: /path/to/your/application
   - Application URL: Your domain or subdomain
   - Application startup file: app.js
   - Environment variables: Add the same variables as in your .env file

### 6. Start the Application

1. Click "Start" in the Node.js App interface
2. Your application should now be running
3. If your hosting supports PM2, use it to keep the application running:
   ```
   pm2 start app.js --name pelnora
   ```

## Troubleshooting

### Database Connection Issues

- Verify your database credentials in the .env file
- Make sure the database user has the correct permissions
- Check if the database server is running

### Application Not Starting

- Check the error logs in cPanel
- Verify that all dependencies are installed correctly
- Make sure the Node.js version is compatible (18.x or higher)

### 404 Errors

- Verify that the .htaccess file is properly configured
- Check if mod_rewrite is enabled on your server

## Support

If you encounter any issues, please contact support at support@pelnora.in