# One-click deploy script for findGoodDomainName (Windows PowerShell)
# Usage: .\scripts\deploy.ps1

param(
  [string]$Server = "74.48.150.185",
  [int]$Port = 22,
  [string]$User = "root",
  [string]$Password = "5gvR17fk2z",
  [string]$RemoteDir = "/root/findgooddomain",
  [int]$AppPort = 3000
)

$ErrorActionPreference = "Stop"
$RootDir = Split-Path -Parent $PSScriptRoot

Write-Host "=== FindGoodDomain Deploy Script ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check dependencies
Write-Host "[1/5] Checking local build..." -ForegroundColor Yellow
Set-Location $RootDir
try { bun --version | Out-Null } catch { Write-Host "Error: bun is not installed" -ForegroundColor Red; exit 1 }

# Step 2: Install deps
Write-Host "[2/5] Installing dependencies..." -ForegroundColor Yellow
if (-not (Test-Path "node_modules")) {
  bun install
} else {
  Write-Host "   Dependencies already installed."
}

# Step 3: Create package
Write-Host "[3/5] Creating deployment package..." -ForegroundColor Yellow
$Timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$PackageName = "deploy-$Timestamp.tar.gz"
$TempDir = Join-Path $env:TEMP "fgdn-deploy-$Timestamp"
New-Item -ItemType Directory -Path $TempDir -Force | Out-Null

# Copy files
Copy-Item -Path "$RootDir\*" -Destination $TempDir -Recurse -Exclude @('node_modules', '.git', 'data', 'bun.lock', '.env', 'deploy-*.tar.gz') -ErrorAction SilentlyContinue

# Remove any existing .env and data dir from package
Remove-Item -Path "$TempDir\.env" -ErrorAction SilentlyContinue
Remove-Item -Path "$TempDir\data" -Recurse -ErrorAction SilentlyContinue

# Create production .env
$JwtSecret = "fgdn-prod-$(Get-Random -Minimum 100000 -Maximum 999999)"
$AdminToken = "admin-token-$(Get-Random -Minimum 100000 -Maximum 999999)"

@"
PORT=$AppPort
JWT_SECRET=$JwtSecret
ADMIN_TOKEN=$AdminToken
DEEPSEEK_API_KEY=${env:DEEPSEEK_API_KEY:-your_deepseek_api_key_here}
DEEPSEEK_BASE_URL=https://api.deepseek.com/v1
DB_PATH=./data/app.db
"@ | Out-File -FilePath "$TempDir\.env" -Encoding utf8

# Create tar.gz
Push-Location $TempDir
& tar czf "$RootDir\$PackageName" * 2>$null
if (-not $?) {
  # Fallback: use Compress-Archive
  Compress-Archive -Path "$TempDir\*" -DestinationPath "$RootDir\deploy-$Timestamp.zip" -Force
  $PackageName = "deploy-$Timestamp.zip"
}
Pop-Location
Remove-Item -Path $TempDir -Recurse -Force -ErrorAction SilentlyContinue
Write-Host "   Package: $PackageName"

# Step 4: Upload to server
Write-Host "[4/5] Uploading to server..." -ForegroundColor Yellow

# Try SSH key first, fallback to password
$connString = "${User}@${Server}"
$sshOpts = @("-p", $Port, "-o", "StrictHostKeyChecking=no", "-o", "UserKnownHostsFile=/dev/null")

# Test connection
Write-Host "   Testing SSH connection..."
$testResult = & scp @sshOpts -o "BatchMode=yes" -o "ConnectTimeout=10" "$PackageName" "${connString}:${RemoteDir}/" 2>&1
if ($LASTEXITCODE -ne 0) {
  Write-Host "   SSH key not available, using password auth..." -ForegroundColor Gray
  
  # Try with sshpass if available
  $sshpassCheck = Get-Command sshpass -ErrorAction SilentlyContinue
  if ($sshpassCheck) {
    Write-Host "   Using sshpass..."
    & sshpass -p "$Password" scp @sshOpts "$PackageName" "${connString}:${RemoteDir}/"
    if ($LASTEXITCODE -ne 0) { throw "Upload failed" }
  } else {
    Write-Host "   Please enter password when prompted (default: $Password)" -ForegroundColor Gray
    Write-Host "   Or install sshpass: choco install sshpass" -ForegroundColor Gray
    & scp @sshOpts "$PackageName" "${connString}:${RemoteDir}/"
    if ($LASTEXITCODE -ne 0) { throw "Upload failed. Please check SSH connection." }
  }
} else {
  Write-Host "   Upload complete."
}

Remove-Item -Path "$RootDir\$PackageName" -Force -ErrorAction SilentlyContinue

# Step 5: Setup and start on server
Write-Host "[5/5] Setting up server..." -ForegroundColor Yellow

$setupScript = @'
#!/bin/bash
set -e
REMOTE_DIR="/root/findgooddomain"
APP_PORT="APP_PORT_PLACEHOLDER"

cd $REMOTE_DIR

# Install bun if needed
if ! command -v bun &> /dev/null; then
  echo "Installing bun..."
  curl -fsSL https://bun.sh/install | bash
  export BUN_INSTALL="$HOME/.bun"
  export PATH="$BUN_INSTALL/bin:$PATH"
fi

# Find latest package
LATEST=$(ls -t deploy-*.tar.gz deploy-*.zip 2>/dev/null | head -1)
if [ -z "$LATEST" ]; then
  echo "Error: No package found"
  exit 1
fi

echo "Extracting $LATEST..."
if [[ "$LATEST" == *.zip ]]; then
  unzip -o "$LATEST" -d app_tmp
else
  mkdir -p app_tmp
  tar xzf "$LATEST" -C app_tmp
fi
rm "$LATEST"

# Backup old app
[ -d app ] && mv app "app.bak.$(date +%Y%m%d%H%M%S)"

mv app_tmp app
cd app

# Install production deps
bun install --production

# Create data dir
mkdir -p data

# Kill old process
pkill -f "bun.*index.ts" 2>/dev/null || true
sleep 1

# Start app
nohup bun run index.ts > /var/log/findgooddomain.log 2>&1 &
echo "Server started PID: $!"
echo "App URL: http://74.48.150.185:$APP_PORT"
'@
$setupScript = $setupScript.Replace('APP_PORT_PLACEHOLDER', $AppPort.ToString())

# Execute setup on server
$scriptPath = Join-Path $env:TEMP "fgdn-setup-$(Get-Random).sh"
$setupScript | Out-File -FilePath $scriptPath -Encoding ascii -NoNewline

try {
  $sshpassCheck = Get-Command sshpass -ErrorAction SilentlyContinue
  if ($sshpassCheck) {
    & sshpass -p "$Password" scp @sshOpts $scriptPath "${connString}:/tmp/setup.sh"
    & sshpass -p "$Password" ssh @sshOpts "$connString" "bash /tmp/setup.sh"
  } else {
    Write-Host "   Running remote setup..." -ForegroundColor Gray
    & scp @sshOpts $scriptPath "${connString}:/tmp/setup.sh"
    & ssh @sshOpts "$connString" "bash /tmp/setup.sh"
  }
} finally {
  Remove-Item $scriptPath -Force -ErrorAction SilentlyContinue
}

Write-Host ""
Write-Host "=== Deployment Complete ===" -ForegroundColor Green
Write-Host "App URL: http://${Server}:$AppPort" -ForegroundColor Cyan
Write-Host ""
Write-Host "IMPORTANT: Set your DEEPSEEK_API_KEY on the server:" -ForegroundColor Yellow
Write-Host "  ssh root@$Server -p $Port" -ForegroundColor Gray
Write-Host "  cd $RemoteDir/app" -ForegroundColor Gray
Write-Host "  echo 'DEEPSEEK_API_KEY=sk-...' >> .env" -ForegroundColor Gray
Write-Host "  pkill -f 'bun.*index.ts' && nohup bun run index.ts > /var/log/findgooddomain.log 2>&1 &" -ForegroundColor Gray
Write-Host ""
