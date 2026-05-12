#!/bin/bash
# Direct server start script (run on the server itself)
# Usage: bash scripts/start.sh

set -e

echo "=== FindGoodDomain Server Setup ==="
cd "$(dirname "$0")/.."

# 1. Install bun if needed
echo "[1/4] Checking bun..."
if ! command -v bun &> /dev/null; then
  echo "   Installing bun..."
  curl -fsSL https://bun.sh/install | bash
  export BUN_INSTALL="$HOME/.bun"
  export PATH="$BUN_INSTALL/bin:$PATH"
fi
echo "   Bun: $(bun --version)"

# 2. Install dependencies
echo "[2/4] Installing dependencies..."
rm -f bun.lock
rm -rf node_modules
bun install

# 3. Create .env if not exists
echo "[3/4] Configuring environment..."
if [ ! -f .env ]; then
  cp .env.example .env
  echo "   Created .env from .env.example"
  echo "   >>> IMPORTANT: Edit .env and set DEEPSEEK_API_KEY <<<"
fi

# 4. Start the app
echo "[4/4] Starting server..."
mkdir -p data

# Kill old process if exists
pkill -f "bun.*index.ts" 2>/dev/null || true
sleep 1

export BUN_INSTALL="$HOME/.bun"
export PATH="$BUN_INSTALL/bin:$PATH"

PORT="${PORT:-3000}"
nohup bun run index.ts > /var/log/findgooddomain.log 2>&1 &
PID=$!

sleep 2
if kill -0 $PID 2>/dev/null; then
  echo ""
  echo "=== Server Started ==="
  echo "PID: $PID"
  echo "URL: http://$(hostname -I | awk '{print $1}'):$PORT"
  echo "Log: /var/log/findgooddomain.log"
  echo ""
  echo "Set your DeepSeek API key:"
  echo "  echo 'DEEPSEEK_API_KEY=sk-...' >> .env"
  echo "  bash scripts/start.sh   # restart"
else
  echo "Error: Server failed to start. Check log: /var/log/findgooddomain.log"
  exit 1
fi
