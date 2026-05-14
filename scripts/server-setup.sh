#!/bin/bash
# Server setup: Nginx + Let's Encrypt SSL
# Run ONCE on Ubuntu server:
#   bash scripts/server-setup.sh www.zhutuan.top
# Prerequisites: Domain DNS A record must point to THIS server's IP

set -e

DOMAIN="${1:-www.zhutuan.top}"
EMAIL="${2:-admin@zhutuan.top}"
APP_PORT="${3:-3000}"
SERVER_IP=$(curl -s https://api.ipify.org 2>/dev/null || hostname -I | awk '{print $1}')

echo "=== Server Setup: $DOMAIN ==="
echo "Server IP: $SERVER_IP"
echo ""

# 1. Check DNS
echo "[1/5] Checking DNS..."
if command -v dig &> /dev/null; then
  DNS_IP=$(dig +short "$DOMAIN" A 2>/dev/null)
elif command -v nslookup &> /dev/null; then
  DNS_IP=$(nslookup "$DOMAIN" 2>/dev/null | grep -A1 "Name:" | tail -1 | awk '{print $NF}')
else
  DNS_IP=""
fi

if [ -z "$DNS_IP" ]; then
  echo "   WARNING: Cannot resolve $DOMAIN. Ensure DNS A record points to $SERVER_IP"
elif [ "$DNS_IP" != "$SERVER_IP" ]; then
  echo "   ERROR: $DOMAIN resolves to $DNS_IP, but server IP is $SERVER_IP"
  echo "   Please update DNS A record for $DOMAIN to point to $SERVER_IP first!"
  echo "   Then re-run: bash scripts/server-setup.sh $DOMAIN"
  exit 1
else
  echo "   DNS OK: $DOMAIN -> $DNS_IP"
fi

# 2. Install packages
echo "[2/5] Installing Nginx + Certbot..."
apt-get update -qq
if ! command -v nginx &> /dev/null; then
  apt-get install -y -qq nginx
  systemctl enable nginx
fi
if ! command -v certbot &> /dev/null; then
  apt-get install -y -qq certbot
fi
echo "   Ready: nginx=$(nginx -v 2>&1 | cut -d/ -f2) certbot=$(certbot --version 2>&1 | head -1 | awk '{print $2}')"

# 3. Create HTTP-only Nginx config (SSL added after cert is obtained)
echo "[3/5] Creating Nginx config (HTTP only)..."
cat > "/etc/nginx/sites-available/$DOMAIN" << 'NGINXEOF'
# HTTP server
server {
    listen 80;
    listen [::]:80;
    server_name DOMAIN_PLACEHOLDER;

    # ACME challenge for Let's Encrypt
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}
NGINXEOF

sed -i "s/DOMAIN_PLACEHOLDER/$DOMAIN/g" "/etc/nginx/sites-available/$DOMAIN"

ln -sf "/etc/nginx/sites-available/$DOMAIN" "/etc/nginx/sites-enabled/$DOMAIN"
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
echo "   HTTP config created"

# 4. Get SSL certificate
echo "[4/5] Getting SSL certificate..."
certbot certonly --webroot -w /var/www/html \
  -d "$DOMAIN" \
  --non-interactive --agree-tos --email "$EMAIL" 2>&1

if [ $? -ne 0 ]; then
  echo ""
  echo "   ERROR: Certificate request failed."
  echo "   Make sure:"
  echo "   1. DNS A record for $DOMAIN points to $SERVER_IP"
  echo "   2. Port 80 is open (ufw allow 80)"
  echo "   3. No other web server is running on port 80"
  exit 1
fi
echo "   Certificate obtained"

# 5. Add HTTPS server block with proxy to Bun app
echo "[5/5] Adding HTTPS + reverse proxy..."
cat > "/etc/nginx/sites-available/$DOMAIN" << NGINXEOF
# HTTP - ACME challenge + redirect to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN;

    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    location / {
        return 301 https://\$host\$request_uri;
    }
}

# HTTPS - reverse proxy to Bun app
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name $DOMAIN;

    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;

    # Modern SSL config
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # Security headers
    add_header Strict-Transport-Security "max-age=63072000" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;

    # Proxy to Bun app
    location / {
        proxy_pass http://127.0.0.1:$APP_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 60s;
    }
}
NGINXEOF

nginx -t && systemctl reload nginx

# Configure firewall
if command -v ufw &> /dev/null; then
  ufw allow 80/tcp 2>/dev/null || true
  ufw allow 443/tcp 2>/dev/null || true
  ufw allow 22/tcp 2>/dev/null || true
fi

# Setup auto-renewal cron
if [ ! -f /etc/cron.d/certbot-renewal ]; then
  echo "0 3 * * * root certbot renew --quiet --post-hook 'systemctl reload nginx'" > /etc/cron.d/certbot-renewal
fi

echo ""
echo "=== Setup Complete ==="
echo ""
echo "  https://$DOMAIN"
echo ""
echo "  SSL auto-renewal: daily at 3am (check: cat /etc/cron.d/certbot-renewal)"
echo "  Next step: bash scripts/start.sh"
echo ""
