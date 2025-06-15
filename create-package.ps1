# Create deployment package for cPanel
Write-Host "🚀 Creating cPanel deployment package..." -ForegroundColor Blue

# Create temporary directory
$tempDir = "pelnora-cpanel-deploy"
if (Test-Path $tempDir) {
    Remove-Item -Recurse -Force $tempDir
}
New-Item -ItemType Directory -Path $tempDir

Write-Host "📦 Building application..." -ForegroundColor Yellow
npm run build

Write-Host "📁 Copying files..." -ForegroundColor Yellow

# Copy essential files
Copy-Item "dist" -Destination "$tempDir/dist" -Recurse
New-Item -ItemType Directory -Path "$tempDir/server"
Copy-Item "server/index-cpanel.js" -Destination "$tempDir/server/index.js"
Copy-Item "package-cpanel.json" -Destination "$tempDir/package.json"
Copy-Item ".env.example" -Destination "$tempDir/.env.example"

# Create startup file for cPanel
"const app = require('./server/index.js');" | Out-File -FilePath "$tempDir/app.js" -Encoding UTF8

# Create README for deployment
$readmeContent = @"
# Pelnora cPanel Deployment

## Files included:
- server/index.js - Main server file
- dist/ - Built frontend files
- package.json - Dependencies
- .env.example - Environment template
- app.js - cPanel startup file

## Deployment steps:
1. Upload all files to your cPanel Node.js app directory
2. Set app.js as your startup file in cPanel
3. Configure environment variables
4. Install dependencies
5. Start the application

## Environment Variables needed:
- NODE_ENV=production
- DB_HOST=localhost
- DB_USER=your_db_user
- DB_PASSWORD=your_db_password
- DB_NAME=your_db_name
- SESSION_SECRET=your-secret-key

## Database Setup:
Create a MySQL database in cPanel and update the environment variables accordingly.
"@

$readmeContent | Out-File -FilePath "$tempDir/README.md" -Encoding UTF8

# Create zip file
Write-Host "🗜️ Creating zip file..." -ForegroundColor Yellow
Compress-Archive -Path "$tempDir/*" -DestinationPath "pelnora-cpanel.zip" -Force

# Cleanup
Remove-Item -Recurse -Force $tempDir

Write-Host "✅ Package created: pelnora-cpanel.zip" -ForegroundColor Green
Write-Host "📋 Ready for upload to cPanel!" -ForegroundColor Blue