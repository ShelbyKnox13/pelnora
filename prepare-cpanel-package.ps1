# PowerShell script to prepare a deployment package for cPanel

# Create a temporary directory for the deployment package
$tempDir = ".\cpanel-deploy-package"
New-Item -ItemType Directory -Force -Path $tempDir

# Build the project
Write-Host "Building the project..." -ForegroundColor Green
npm run build

# Copy the built files to the deployment package
Write-Host "Copying built files..." -ForegroundColor Green
Copy-Item -Path ".\dist\*" -Destination $tempDir -Recurse -Force

# Copy server files
Write-Host "Copying server files..." -ForegroundColor Green
Copy-Item -Path ".\server\index.js" -Destination "$tempDir\server\" -Force
Copy-Item -Path ".\server\storage-mysql.ts" -Destination "$tempDir\server\" -Force
Copy-Item -Path ".\app.js" -Destination $tempDir -Force
Copy-Item -Path ".\package.json" -Destination $tempDir -Force
Copy-Item -Path ".\package-cpanel.json" -Destination "$tempDir\package.json" -Force

# Create a .htaccess file for proper routing
$htaccessContent = @"
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  
  # Redirect all requests to the Node.js application except for static files
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule ^(.*)$ app.js [QSA,L]
</IfModule>
"@
Set-Content -Path "$tempDir\.htaccess" -Value $htaccessContent

# Create a README file with deployment instructions
$readmeContent = @"
# Pelnora cPanel Deployment Package

## Deployment Instructions

1. Upload all files in this package to your cPanel hosting account
2. Make sure Node.js is available on your hosting (many cPanel hosts offer Node.js)
3. Install dependencies by running: `npm install`
4. Start the application: `node app.js`
5. If your hosting supports PM2, use it to keep the application running:
   `pm2 start app.js --name pelnora`

## Configuration

- Update the database connection details in `server/index.js` if needed
- Make sure the .htaccess file is properly uploaded and working
"@
Set-Content -Path "$tempDir\README.md" -Value $readmeContent

# Create a ZIP archive of the deployment package
$zipFile = "pelnora-cpanel-deploy.zip"
Compress-Archive -Path "$tempDir\*" -DestinationPath $zipFile -Force

# Clean up the temporary directory
Remove-Item -Path $tempDir -Recurse -Force

Write-Host "Deployment package created: $zipFile" -ForegroundColor Green
Write-Host "Upload this ZIP file to your cPanel hosting and extract it." -ForegroundColor Yellow