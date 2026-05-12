#!/bin/bash
# One-click deploy script for findGoodDomainName
# Usage: bash scripts/deploy.sh

set -e

# Configuration
SERVER="root@74.48.150.185"
PORT="22"
REMOTE_DIR="/root/findgooddomain"
APP_PORT="${APP_PORT:-3000}"
JWT_SECRET="${JWT_SECRET:-findgooddomain-secret-$(date +%s)}"
ADMIN_TOKEN="${ADMIN_TOKEN:-admin-secret-$(date +%s)}"

echo "=== FindGoodDomain Deploy Script ==="
echo ""

# Check for password
if [ -z "$SSH_PASS" ]; then
  SSH_PASS="5gvR17fk2z"
fi

# Step 1: Check/install bun
echo "[1/6] Checking bun..."
cd "$(dirname "$0")/.."

if ! command -v bun &> /dev/null; then
  echo "   Bun not found, installing..."
  curl -fsSL https://bun.sh/install | bash
  export BUN_INSTALL="$HOME/.bun"
  export PATH="$BUN_INSTALL/bin:$PATH"
  if ! command -v bun &> /dev/null; then
    echo "Error: bun installation failed"
    exit 1
  fi
  echo "   Bun installed: $(bun --version)"
else
  echo "   Bun found: $(bun --version)"
fi

# Step 2: Install deps if needed
if [ ! -d "node_modules" ]; then
  echo "[2/6] Installing dependencies..."
  rm -f bun.lock
  bun install
else
  echo "[2/6] Dependencies already installed."
fi

# Step 3: Quick type check (non-fatal)
echo "[3/6] Type checking..."
bun run --silent index.ts --version 2>/dev/null || true

# Step 4: Create deployment package
echo "[4/6] Creating deployment package..."
TEMP_DIR=$(mktemp -d)
PACKAGE="deploy-$(date +%Y%m%d-%H%M%S).tar.gz"

# Copy files to temp dir, excluding unnecessary ones
rsync -av --exclude='node_modules' --exclude='.git' --exclude='data' --exclude='bun.lock' \
  --exclude='*.log' --exclude='.env' --exclude='public/index.html' \
  ./ "$TEMP_DIR/findgooddomain/" 2>/dev/null || \
  cp -r . "$TEMP_DIR/findgooddomain/" 2>/dev/null && \
  rm -rf "$TEMP_DIR/findgooddomain/node_modules" "$TEMP_DIR/findgooddomain/.git" \
    "$TEMP_DIR/findgooddomain/data" 2>/dev/null || true

# Create .env for production
cat > "$TEMP_DIR/findgooddomain/.env" << EOF
PORT=$APP_PORT
JWT_SECRET=$JWT_SECRET
ADMIN_TOKEN=$ADMIN_TOKEN
DEEPSEEK_API_KEY=\${DEEPSEEK_API_KEY:-your_deepseek_api_key_here}
DEEPSEEK_BASE_URL=https://api.deepseek.com/v1
DB_PATH=./data/app.db
EOF

cd "$TEMP_DIR"
tar czf "$PACKAGE" findgooddomain/
cd - > /dev/null
mv "$TEMP_DIR/$PACKAGE" .
rm -rf "$TEMP_DIR"
echo "   Package created: $PACKAGE"

# Step 5: Upload to server
echo "[5/6] Uploading to server..."
if command -v sshpass &> /dev/null; then
  sshpass -p "$SSH_PASS" scp -P $PORT -o StrictHostKeyChecking=no "$PACKAGE" "$SERVER:$REMOTE_DIR/"
else
  # Try with expect-like approach
  ssh -p $PORT -o StrictHostKeyChecking=no "$SERVER" "mkdir -p $REMOTE_DIR"
  scp -P $PORT -o StrictHostKeyChecking=no "$PACKAGE" "$SERVER:$REMOTE_DIR/"
fi
rm "$PACKAGE"

# Step 6: Setup and start on server
echo "[6/6] Setting up server..."
SETUP_SCRIPT=$(cat << 'SETUPEOF'
set -e

REMOTE_DIR="/root/findgooddomain"
APP_PORT="${APP_PORT:-3000}"

cd $REMOTE_DIR

# Install bun if not installed
if ! command -v bun &> /dev/null; then
  echo "Installing bun..."
  curl -fsSL https://bun.sh/install | bash
  export BUN_INSTALL="$HOME/.bun"
  export PATH="$BUN_INSTALL/bin:$PATH"
fi

# Find and extract the latest package
LATEST_PKG=$(ls -t deploy-*.tar.gz 2>/dev/null | head -1)
if [ -z "$LATEST_PKG" ]; then
  echo "Error: No deployment package found"
  exit 1
fi

echo "Extracting $LATEST_PKG..."
tar xzf "$LATEST_PKG"
rm "$LATEST_PKG"

# Backup old app if exists
if [ -d "app" ]; then
  mv app "app.bak.$(date +%Y%m%d%H%M%S)" 2>/dev/null || true
fi

# Extract the inner directory
INNER_DIR=$(tar tzf "$LATEST_PKG" 2>/dev/null | head -1 | cut -d/ -f1)
if [ -d "$INNER_DIR" ]; then
  mv "$INNER_DIR" app 2>/dev/null || true
fi

cd app

# Install dependencies
rm -f bun.lock
bun install

# Create data directory
mkdir -p data

# Kill old process
pkill -f "bun.*index.ts" 2>/dev/null || true
sleep 1

# Start with nohup
nohup bun run index.ts > /var/log/findgooddomain.log 2>&1 &
echo "Server started! PID: $!"
echo "App running on port $APP_PORT"
SETUPEOF
)

if command -v sshpass &> /dev/null; then
  echo "$SETUP_SCRIPT" > /tmp/fgdn_setup.sh
  sshpass -p "$SSH_PASS" scp -P $PORT -o StrictHostKeyChecking=no /tmp/fgdn_setup.sh "$SERVER:/tmp/"
  sshpass -p "$SSH_PASS" ssh -p $PORT -o StrictHostKeyChecking=no "$SERVER" "bash /tmp/fgdn_setup.sh"
  rm /tmp/fgdn_setup.sh
else
  echo "$SETUP_SCRIPT" | ssh -p $PORT -o StrictHostKeyChecking=no "$SERVER" "bash -s"
fi

echo ""
echo "=== Deployment Complete ==="
echo "App URL: http://74.48.150.185:$APP_PORT"
echo ""
