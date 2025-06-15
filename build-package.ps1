# Create deployment package for cPanel
Write-Host "Creating cPanel deployment package..." -ForegroundColor Blue

# Create temporary directory
$tempDir = "pelnora-cpanel-deploy"
if (Test-Path $tempDir) {
    Remove-Item -Recurse -Force $tempDir
}
New-Item -ItemType Directory -Path $tempDir

Write-Host "Building application..." -ForegroundColor Yellow
npm run build

Write-Host "Copying files..." -ForegroundColor Yellow

# Copy essential files
Copy-Item "dist" -Destination "$tempDir/dist" -Recurse
New-Item -ItemType Directory -Path "$tempDir/server"
Copy-Item "server/index-cpanel.js" -Destination "$tempDir/server/index.js"
Copy-Item "package-cpanel.json" -Destination "$tempDir/package.json"
Copy-Item ".env.example" -Destination "$tempDir/.env.example"

# Create startup file for cPanel
"const app = require('./server/index.js');" | Out-File -FilePath "$tempDir/app.js" -Encoding UTF8

# Create README
"# Pelnora cPanel Deployment Package`n`nFiles included:`n- server/index.js`n- dist/`n- package.json`n- app.js`n`nSee cpanel-deploy-guide.md for full instructions." | Out-File -FilePath "$tempDir/README.txt" -Encoding UTF8

# Create zip file
Write-Host "Creating zip file..." -ForegroundColor Yellow
Compress-Archive -Path "$tempDir/*" -DestinationPath "pelnora-cpanel.zip" -Force

# Cleanup
Remove-Item -Recurse -Force $tempDir

Write-Host "Package created: pelnora-cpanel.zip" -ForegroundColor Green
Write-Host "Ready for upload to cPanel!" -ForegroundColor Blue