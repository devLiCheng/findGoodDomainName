#!/bin/bash
# Server setup: Nginx + Let's Encrypt SSL + Firewall
# Run ONCE on your Ubuntu server:
#   bash scripts/server-setup.sh
# Prerequisites: Domain DNS must already point to this server's IP

set -e

DOMAIN="${1:-www.zhutuan.top}"
EMAIL="${2:-admin@zhutuan.top}"
APP_PORT="${3:-3000}"
SERVER_IP=$(curl -s https://api.ipify.org 2>/dev/null || hostname -I | awk '{print $1}')

echo "=== Server Setup: $DOMAIN ==="
echo "Server IP: $SERVER_IP"
echo ""

# 1. Check DNS
echo "[1/6] Checking DNS for $DOMAIN..."
DNS_IP=$(dig +short "$DOMAIN" A 2>/dev/null || nslookup "$DOMAIN" 2>/dev/null | grep -A1 "Name:" | tail -1 | awk '{print $NF}')
if [ -z "$DNS_IP" ]; then
  echo "   WARNING: Could not resolve $DOMAIN DNS. Make sure DNS A record points to $SERVER_IP"
  echo "   Continuing anyway..."
else
  echo "   $DOMAIN resolves to $DNS_IP"
fi

# 2. Install Nginx
echo "[2/6] Installing Nginx..."
if ! command -v nginx &> /dev/null; then
  apt-get update -qq
  apt-get install -y -qq nginx
  systemctl enable nginx
  systemctl start nginx
  echo "   Nginx installed"
else
  echo "   Nginx already installed: $(nginx -v 2>&1)"
fi

# 3. Install Certbot (Let's Encrypt)
echo "[3/6] Installing Certbot..."
if ! command -v certbot &> /dev/null; then
  apt-get install -y -qq certbot python3-certbot-nginx
  echo "   Certbot installed"
else
  echo "   Certbot already installed: $(certbot --version 2>&1 | head -1)"
fi

# 4. Create Nginx config for the domain
echo "[4/6] Creating Nginx config..."
cat > "/etc/nginx/sites-available/$DOMAIN" << NGINXEOF
# HTTP — redirect to HTTPS
server {
    listen 80;
    server_name $DOMAIN;

    # Let's Encrypt verification
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    location / {
        return 301 https://\$host\$request_uri;
    }
}

# HTTPS — reverse proxy to Bun app
server {
    listen 443 ssl http2;
    server_name $DOMAIN;

    # SSL managed by Certbot
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

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

ln -sf "/etc/nginx/sites-available/$DOMAIN" "/etc/nginx/sites-enabled/$DOMAIN"
rm -f /etc/nginx/sites-enabled/default

# Test and reload nginx config (HTTP only at this point)
# Remove SSL lines temporarily for certbot to work
sed -i 's/listen 443/#listen 443/' "/etc/nginx/sites-available/$DOMAIN"
nginx -t && systemctl reload nginx
echo "   Nginx HTTP config created"

# 5. Get SSL certificate
echo "[5/6] Getting SSL certificate from Let's Encrypt..."
# Restore HTTPS config
sed -i 's/#listen 443/listen 443/' "/etc/nginx/sites-available/$DOMAIN"

certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos --email "$EMAIL" --redirect 2>&1 || {
  echo "   Certbot auto-config failed, trying manual..."
  certbot certonly --webroot -w /var/www/html -d "$DOMAIN" --non-interactive --agree-tos --email "$EMAIL" 2>&1
}

nginx -t && systemctl reload nginx

# Verify cert renewal timer
if systemctl is-active --quiet certbot.timer 2>/dev/null; then
  echo "   Certbot auto-renewal timer: ACTIVE"
else
  echo "   Setting up auto-renewal..."
  echo "0 3 * * * root certbot renew --quiet --post-hook 'systemctl reload nginx'" > /etc/cron.d/certbot-renewal
  echo "   Auto-renewal cronjob created (daily 3am)"
fi

# 6. Configure firewall
echo "[6/6] Configuring firewall..."
if command -v ufw &> /dev/null; then
  ufw allow 80/tcp 2>/dev/null || true
  ufw allow 443/tcp 2>/dev/null || true
  ufw allow 22/tcp 2>/dev/null || true
  echo "   Firewall: HTTP(80), HTTPS(443), SSH(22) allowed"
fi

echo ""
echo "=== Setup Complete ==="
echo ""
echo "  Domain:   https://$DOMAIN"
echo "  Proxied to: http://127.0.0.1:$APP_PORT"
echo ""
echo "Next steps:"
echo "  1. Deploy the app: bash scripts/start.sh"
echo "  2. SSL auto-renews via certbot timer (check: systemctl status certbot.timer)"
echo "  3. Test: curl https://$DOMAIN"
echo ""
