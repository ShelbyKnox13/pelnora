# PowerShell script to prepare a complete deployment package for cPanel including frontend and backend

# Define temporary directory for packaging
$tempDir = ".\cpanel-deploy-package"
if (Test-Path $tempDir) {
    Remove-Item -Recurse -Force $tempDir
}
New-Item -ItemType Directory -Force -Path $tempDir

# Build the frontend using Next.js build and export commands
Write-Host "Building the frontend project..." -ForegroundColor Green
npm run build
npm run export

# Verify the "dist" folder exists and is not empty
if (-Not (Test-Path ".\dist") -or ((Get-ChildItem ".\dist" -Recurse | Measure-Object).Count -eq 0)) {
    Write-Host "Error: 'dist' folder is missing or empty. Halting packaging process." -ForegroundColor Red
    exit 1
}

# Copy the built frontend files to the deployment package
Write-Host "Copying frontend built files..." -ForegroundColor Green
Copy-Item -Path ".\dist\*" -Destination $tempDir -Recurse -Force

# Copy server files
Write-Host "Copying server files..." -ForegroundColor Green
if (-Not (Test-Path ".\server\index-cpanel.js")) {
    Write-Host "Error: server/index-cpanel.js not found. Please ensure it exists." -ForegroundColor Red
    exit 1
}
Copy-Item -Path ".\server\index-cpanel.js" -Destination "$tempDir\server\" -Force
Copy-Item -Path ".\package-cpanel.json" -Destination "$tempDir\package.json" -Force
Copy-Item -Path ".\.env.example" -Destination $tempDir -Force
Copy-Item -Path ".\app.js" -Destination $tempDir -Force

# Create .htaccess file for routing
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
$htaccessContentEscaped = @"
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  
  # Redirect all requests to the Node.js application except for static files
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule ^(.*)$ app.js [QSA,L]
</IfModule>
"@
Set-Content -Path "$tempDir\.htaccess" -Value $htaccessContentEscaped

# Create README file with deployment instructions
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

- Update the database connection details in environment variables or server/index-cpanel.js if needed
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
