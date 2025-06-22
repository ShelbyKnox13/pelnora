# Pelnora cPanel Deployment Package

## Deployment Instructions

1. Upload all files in this package to your cPanel hosting account
2. Make sure Node.js is available on your hosting (many cPanel hosts offer Node.js)
3. Install dependencies by running: 
pm install
4. Start the application: 
ode app.js
5. If your hosting supports PM2, use it to keep the application running:
   pm2 start app.js --name pelnora

## Configuration

- Update the database connection details in environment variables or server/index-cpanel.js if needed
- Make sure the .htaccess file is properly uploaded and working
