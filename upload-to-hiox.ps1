# PowerShell script to upload Pelnora project to Hiox Cloud
# Run this script from your project directory

param(
    [string]$ServerIP = "103.235.106.35",
    [int]$Port = 2624,
    [string]$Username = "root",
    [string]$RemotePath = "/var/www/html/pelnora"
)

Write-Host "🚀 Uploading Pelnora Jewellers to Hiox Cloud..." -ForegroundColor Green

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: package.json not found. Please run this script from your project root directory." -ForegroundColor Red
    exit 1
}

# Create a temporary directory for deployment files
$TempDir = "temp-hiox-deploy"
if (Test-Path $TempDir) {
    Remove-Item $TempDir -Recurse -Force
}
New-Item -ItemType Directory -Path $TempDir | Out-Null

Write-Host "📦 Preparing files for deployment..." -ForegroundColor Yellow

# Copy necessary files and directories
$FilesToCopy = @(
    "package.json",
    "package-lock.json",
    "server",
    "client",
    "shared",
    "migrate.js",
    "migrate.ts",
    "drizzle.config.ts",
    "tsconfig.json",
    "tailwind.config.ts",
    "vite.config.ts",
    "components.json",
    ".env.example"
)

foreach ($item in $FilesToCopy) {
    if (Test-Path $item) {
        if (Test-Path $item -PathType Container) {
            Copy-Item $item -Destination "$TempDir\" -Recurse -Force
            Write-Host "✅ Copied directory: $item" -ForegroundColor Green
        } else {
            Copy-Item $item -Destination "$TempDir\" -Force
            Write-Host "✅ Copied file: $item" -ForegroundColor Green
        }
    } else {
        Write-Host "⚠️  Warning: $item not found, skipping..." -ForegroundColor Yellow
    }
}

# Create production environment file
$EnvContent = @"
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://pelnora_user:Pelnora@2024#Secure@localhost:5432/pelnora_db
JWT_SECRET=your_jwt_secret_here_change_this
ADMIN_EMAIL=admin@pelnora.com
ADMIN_PASSWORD=Admin@2024#Secure
CORS_ORIGIN=http://103.235.106.35,https://103.235.106.35
"@

$EnvContent | Out-File -FilePath "$TempDir\.env" -Encoding UTF8
Write-Host "✅ Created production .env file" -ForegroundColor Green

# Create deployment script for the server
$DeployScript = @"
#!/bin/bash
echo "🚀 Setting up Pelnora Jewellers application..."

# Navigate to application directory
cd /var/www/html/pelnora

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build client if needed
if [ -d "client" ]; then
    echo "🏗️  Building client application..."
    cd client
    npm install
    npm run build
    cd ..
fi

# Run database migrations
echo "🗄️  Running database migrations..."
npm run migrate 2>/dev/null || echo "⚠️  Migration failed or not needed"

# Restart the application
echo "🔄 Restarting application..."
pm2 restart pelnora-app || pm2 start server/index.js --name "pelnora-app"

# Save PM2 configuration
pm2 save

echo "✅ Deployment completed successfully!"
echo "🌐 Your application should be available at: http://103.235.106.35"
echo ""
echo "📋 Useful commands:"
echo "   • Check status: pm2 status"
echo "   • View logs: pm2 logs pelnora-app"
echo "   • Restart: pm2 restart pelnora-app"
"@

$DeployScript | Out-File -FilePath "$TempDir\deploy-app.sh" -Encoding UTF8
Write-Host "✅ Created deployment script" -ForegroundColor Green

Write-Host "`n📤 Files prepared for upload. Now uploading to server..." -ForegroundColor Cyan

# Create SCP command
$ScpCommand = "scp -P $Port -r $TempDir/* ${Username}@${ServerIP}:${RemotePath}/"

Write-Host "`n🔧 To upload the files, run this command:" -ForegroundColor Yellow
Write-Host $ScpCommand -ForegroundColor White

Write-Host "`n📋 Manual Upload Instructions:" -ForegroundColor Cyan
Write-Host "1. Open a terminal/command prompt" -ForegroundColor White
Write-Host "2. Navigate to this directory: $(Get-Location)" -ForegroundColor White
Write-Host "3. Run the SCP command above" -ForegroundColor White
Write-Host "4. Enter the password when prompted: PmnSQeo@p]8y9%6E" -ForegroundColor White
Write-Host "5. SSH into your server and run the deployment script:" -ForegroundColor White
Write-Host "   ssh -p $Port ${Username}@${ServerIP}" -ForegroundColor Gray
Write-Host "   cd $RemotePath" -ForegroundColor Gray
Write-Host "   chmod +x deploy-app.sh" -ForegroundColor Gray
Write-Host "   ./deploy-app.sh" -ForegroundColor Gray

Write-Host "`n🎯 Alternative: Use WinSCP or FileZilla" -ForegroundColor Cyan
Write-Host "Server: $ServerIP" -ForegroundColor White
Write-Host "Port: $Port" -ForegroundColor White
Write-Host "Username: $Username" -ForegroundColor White
Write-Host "Password: PmnSQeo@p]8y9%6E" -ForegroundColor White
Write-Host "Upload the contents of '$TempDir' to '$RemotePath'" -ForegroundColor White

Write-Host "`n✨ After upload, your Pelnora Jewellers MLM platform will be live at:" -ForegroundColor Green
Write-Host "http://$ServerIP" -ForegroundColor Yellow

# Keep the temp directory for manual upload
Write-Host "`n📁 Files ready for upload are in: $TempDir" -ForegroundColor Green
Write-Host "💡 You can delete this directory after successful deployment." -ForegroundColor Gray
