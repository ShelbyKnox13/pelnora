# 🚀 Pelnora Deployment Guide for Shared Hosting

This guide will help you deploy the Pelnora MLM application to a shared hosting environment with Node.js support.

## 📋 Prerequisites

- A shared hosting account with Node.js support (cPanel, Plesk, etc.)
- MySQL database access
- FTP or file manager access to upload files

## 🔧 Step 1: Set Up Database

1. **Login to your hosting control panel**

2. **Create a new MySQL database**:
   - Name it `pelnora_db` (your hosting may prefix it with your username)
   - Note the full database name

3. **Create a database user**:
   - Username: `pelnora_user` (will likely be prefixed)
   - Set a strong password
   - Grant all privileges to this user on the database

4. **Note your database credentials**:
   ```
   Database Host: localhost
   Database Name: [your_username]_pelnora_db
   Database User: [your_username]_pelnora_user
   Database Password: [your password]
   ```

## 📦 Step 2: Upload Files

1. **Upload all files** in this package to your hosting:
   - Use FTP, SFTP, or the hosting file manager
   - Upload to the directory where you want to host the application

2. **Ensure proper file permissions**:
   - Set directories to `755`
   - Set files to `644`
   - Make sure `app.js` and `server/index.js` are executable

## ⚙️ Step 3: Configure Environment Variables

1. **Edit the `.env` file** with your database credentials:
   ```
   DB_HOST=localhost
   DB_USER=[your_username]_pelnora_user
   DB_PASSWORD=[your_password]
   DB_NAME=[your_username]_pelnora_db
   DB_PORT=3306
   
   NODE_ENV=production
   SESSION_SECRET=[generate a random string]
   
   CORS_ORIGIN=https://yourdomain.com
   ```

2. **If your hosting uses a control panel for environment variables**:
   - Set each variable in the control panel instead
   - You may need to remove the `.env` file if your hosting doesn't support it

## 🚀 Step 4: Set Up Node.js Application

### For cPanel Hosting:

1. **Go to the Node.js App Manager** in cPanel

2. **Create a new application**:
   - **Node.js version**: Select the latest available (18.x or higher)
   - **Application mode**: Production
   - **Application root**: Path to your uploaded files
   - **Application URL**: Your domain or subdomain
   - **Application startup file**: `app.js`

3. **Install dependencies**:
   - Click "Run NPM Install" in the Node.js App Manager
   - Wait for the installation to complete

4. **Start the application**:
   - Click "Start/Restart" to launch your application

### For Other Hosting Types:

1. **Check your hosting documentation** for Node.js application setup

2. **Common requirements**:
   - Set the entry point to `app.js`
   - Install dependencies with `npm install`
   - Start the application with `node app.js`

## 🔍 Step 5: Test Your Deployment

1. **Visit your domain** in a web browser

2. **Check the health endpoint**:
   - Visit: `https://yourdomain.com/api/health`
   - Should show: `{"status":"healthy","database":"connected",...}`

3. **Test admin login**:
   - Username: `admin`
   - Password: `Qwertghjkl@13`

## 🛠️ Troubleshooting

### Database Connection Issues:
- Verify database credentials in `.env` file
- Check if your hosting requires a specific host (not always `localhost`)
- Some hosts require full socket path instead of hostname

### Application Won't Start:
- Check application logs in your hosting control panel
- Verify Node.js version compatibility
- Ensure all dependencies are installed

### 404 Errors:
- Check if your application is running
- Verify URL routing in your hosting panel
- Some hosts require specific proxy configurations

## 🔒 Security Recommendations

1. **Change the default admin password** immediately after deployment

2. **Generate a strong SESSION_SECRET** value

3. **Set up HTTPS** for your domain

4. **Regularly backup your database**

## 📞 Need Help?

If you encounter issues during deployment, check:
1. Hosting provider's documentation for Node.js applications
2. Application logs for specific error messages
3. Database connection settings

## 🎉 Success Checklist

- [ ] Database created and configured
- [ ] Files uploaded with correct permissions
- [ ] Environment variables set
- [ ] Dependencies installed
- [ ] Application started
- [ ] Health check endpoint working
- [ ] Admin login successful

Once all items are checked, your Pelnora application is successfully deployed! 🚀