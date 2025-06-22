# Create upload folder for Pelnora Project
$ftpDir = "H:\Website\pelnora\ftpupload"
$sourceDir = "H:\Website\pelnora"

# Create fresh ftpupload directory
if (Test-Path $ftpDir) {
    Remove-Item $ftpDir -Recurse -Force
}
New-Item -ItemType Directory -Path $ftpDir -Force

Write-Host "Created upload folder at: $ftpDir" -ForegroundColor Green

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
        Write-Host "Copied $file" -ForegroundColor Green
    }
}

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
        robocopy $sourcePath $destPath /E /XF "test-*" "debug-*" "*.ps1" "*.md" "node_modules" /XD "node_modules" ".git" "temp-extract" "cpanel-*" "final-package" "fixed-*" /NFL /NDL /NJH /NJS /nc /ns /np
        Write-Host "Copied $folder folder" -ForegroundColor Green
    }
}

Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "1. Open FileZilla" -ForegroundColor White
Write-Host "2. Navigate to: $ftpDir" -ForegroundColor White
Write-Host "3. Select ALL files and folders" -ForegroundColor White
Write-Host "4. Upload to: /var/www/html/pelnora" -ForegroundColor White
