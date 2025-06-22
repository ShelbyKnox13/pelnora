# Create FTP Upload Folder Script for Pelnora Project
# This script copies only the required files for deployment

Write-Host "Creating FTP upload folder..." -ForegroundColor Green

# Create the ftpupload directory
$ftpDir = "H:\Website\pelnora\ftpupload"
if (Test-Path $ftpDir) {
    Remove-Item $ftpDir -Recurse -Force
}
New-Item -ItemType Directory -Path $ftpDir -Force

# Set source directory
$sourceDir = "H:\Website\pelnora"

Write-Host "Copying essential files..." -ForegroundColor Yellow

# Copy essential root files
$essentialFiles = @(
    "package.json",
    "vite.config.ts",
    "tailwind.config.ts", 
    "drizzle.config.ts",
    "migrate.ts"
)

foreach ($file in $essentialFiles) {
    $sourcePath = Join-Path $sourceDir $file
    if (Test-Path $sourcePath) {
        Copy-Item $sourcePath $ftpDir -Force
        Write-Host "✓ Copied $file" -ForegroundColor Green
    } else {
        Write-Host "⚠ $file not found" -ForegroundColor Yellow
    }
}

Write-Host "Copying essential folders..." -ForegroundColor Yellow

# Copy essential folders
$essentialFolders = @(
    "server",
    "client", 
    "shared",
    "scripts"
)

foreach ($folder in $essentialFolders) {
    $sourcePath = Join-Path $sourceDir $folder
    $destPath = Join-Path $ftpDir $folder
    
    if (Test-Path $sourcePath) {
        # Copy folder but exclude test files and other unwanted files
        robocopy $sourcePath $destPath /E /XF "test-*" "debug-*" "*.ps1" "*.md" "node_modules" /XD "node_modules" ".git" "temp-extract" "cpanel-*" "final-package" "fixed-*" /NFL /NDL /NJH /NJS /nc /ns /np
        Write-Host "✓ Copied $folder folder" -ForegroundColor Green
    } else {
        Write-Host "⚠ $folder folder not found" -ForegroundColor Yellow
    }
}

Write-Host "`n🎉 FTP upload folder created successfully!" -ForegroundColor Green
Write-Host "📁 Location: $ftpDir" -ForegroundColor Cyan
Write-Host "`n📋 Next steps:" -ForegroundColor White
Write-Host "1. Open FileZilla" -ForegroundColor White
Write-Host "2. Navigate to: $ftpDir" -ForegroundColor White
Write-Host "3. Select ALL files and folders in ftpupload" -ForegroundColor White
Write-Host "4. Drag them to: /var/www/html/pelnora" -ForegroundColor White

# List what was copied
Write-Host "`n📦 Files ready for upload:" -ForegroundColor Cyan
Get-ChildItem $ftpDir -Recurse | Select-Object Name, @{Name="Type";Expression={if($_.PSIsContainer){"Folder"}else{"File"}}} | Format-Table -AutoSize
