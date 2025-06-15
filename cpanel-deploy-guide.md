# 🚀 Pelnora Deployment Guide for RazorHost cPanel

## 📋 **Complete Step-by-Step Guide**

### **STEP 1: Prepare Your Deployment Package**

1. **Open PowerShell in your project directory**:
   ```powershell
   cd h:/Website/pelnora
   ```

2. **Run the package creation script**:
   ```powershell
   .\create-cpanel-package.ps1
   ```

3. **This will create `pelnora-cpanel.zip`** - your deployment package

### **STEP 2: Set Up Database in cPanel**

1. **Login to your RazorHost cPanel**

2. **Find "MySQL Database Wizard"** (or "MySQL Databases")

3. **Create Database**:
   - Database name: `pelnora_db`
   - cPanel will create: `yourusername_pelnora_db`
   - **Write down the full name!**

4. **Create Database User**:
   - Username: `pelnora_user`
   - Password: Create a strong password (save it!)
   - cPanel will create: `yourusername_pelnora_user`

5. **Grant Privileges**:
   - Select your user and database
   - Grant **ALL PRIVILEGES**
   - Click "Make Changes"

6. **Note these details**:
   ```
   Database Host: localhost
   Database Name: yourusername_pelnora_db
   Database User: yourusername_pelnora_user
   Database Password: [your password]
   ```

### **STEP 3: Create Node.js Application**

1. **In cPanel, find "Node.js App"** (or "Node.js Selector")

2. **Click "Create Application"**

3. **Fill in the form**:
   - **Node.js version**: Select latest (18.x or higher)
   - **Application mode**: Production
   - **Application root**: `pelnora` (or any name you prefer)
   - **Application URL**: Leave blank for main domain, or enter subdomain
   - **Application startup file**: `app.js`

4. **Click "Create"**

### **STEP 4: Upload Your Files**

1. **Go to "File Manager"** in cPanel

2. **Navigate to your application directory**:
   - Usually: `/public_html/pelnora/` (or whatever you named it)

3. **Upload the zip file**:
   - Click "Upload"
   - Select `pelnora-cpanel.zip`
   - Wait for upload to complete

4. **Extract the files**:
   - Right-click on `pelnora-cpanel.zip`
   - Select "Extract"
   - Extract to current directory
   - Delete the zip file after extraction

### **STEP 5: Configure Environment Variables**

1. **Go back to "Node.js App"** in cPanel

2. **Click on your application name**

3. **Find "Environment Variables" section**

4. **Add these variables** (click "Add Variable" for each):

   | Variable Name | Variable Value |
   |---------------|----------------|
   | `NODE_ENV` | `production` |
   | `DB_HOST` | `localhost` |
   | `DB_USER` | `yourusername_pelnora_user` |
   | `DB_PASSWORD` | `your_database_password` |
   | `DB_NAME` | `yourusername_pelnora_db` |
   | `SESSION_SECRET` | `your-super-secret-key-12345` |

   **Replace the values with your actual database details!**

### **STEP 6: Install Dependencies**

1. **In the Node.js App page, find "Run NPM Install"**

2. **Click "Run NPM Install"**

3. **Wait for installation** (may take 2-3 minutes)

4. **You should see "Success" message**

### **STEP 7: Start Your Application**

1. **Click "Restart App"** or "Start App"

2. **Wait for the app to start**

3. **Check the status** - it should show "Running"

### **STEP 8: Test Your Application**

1. **Visit your domain**:
   - If main domain: `https://yourdomain.com`
   - If subdomain: `https://pelnora.yourdomain.com`

2. **You should see the Pelnora homepage**

3. **Test the login**:
   - Admin login: `admin` / `Qwertghjkl@13`
   - Try creating a new user account

4. **Check health endpoint**:
   - Visit: `https://yourdomain.com/api/health`
   - Should show database connected

## 🔧 **Troubleshooting**

### **If the app won't start:**

1. **Check the error logs**:
   - In Node.js App, click "Show Logs"
   - Look for error messages

2. **Common issues**:
   - **Database connection**: Check environment variables
   - **File permissions**: Make sure files are readable
   - **Missing dependencies**: Run NPM Install again

### **If database connection fails:**

1. **Verify database details** in environment variables
2. **Test database connection** in cPanel phpMyAdmin
3. **Make sure user has privileges** on the database

### **If you get 404 errors:**

1. **Check if files uploaded correctly**
2. **Verify app.js exists** in the root directory
3. **Check application startup file** setting

## 📞 **Need Help?**

If you get stuck on any step, let me know:
1. **Which step** you're on
2. **What error message** you're seeing
3. **Screenshot** of the issue (if possible)

## 🎉 **Success Checklist**

- [ ] Database created and user configured
- [ ] Node.js app created in cPanel
- [ ] Files uploaded and extracted
- [ ] Environment variables set
- [ ] Dependencies installed
- [ ] Application started
- [ ] Website accessible
- [ ] Login working
- [ ] Health check shows "connected"

**Once all items are checked, your Pelnora app is live! 🚀**