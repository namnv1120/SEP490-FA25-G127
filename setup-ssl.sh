#!/bin/bash

# Configuration
DOMAIN="snapbuy.com.vn"
EMAIL="admin@snapbuy.com.vn"
NGINX_CONF_DIR="./nginx-proxy/conf.d"
MAIN_CONF="$NGINX_CONF_DIR/snapbuy.conf"
TEMP_CONF="$NGINX_CONF_DIR/snapbuy_temp.conf"

echo "========================================================"
echo "   AUTOGENERATING SSL CERTIFICATES FOR SNAPBUY"
echo "========================================================"

# Check if docker compose is running
if ! docker compose ps | grep -q "nginx-proxy"; then
    echo "Starting Nginx Proxy container..."
else
    echo "Stopping Nginx Proxy temporarily..."
    docker compose stop nginx-proxy
fi

# 1. Backup Main Config (if exists)
if [ -f "$MAIN_CONF" ]; then
    echo "--> Backing up main Nginx config..."
    mv "$MAIN_CONF" "$MAIN_CONF.bak"
fi

# 2. Create Temporary HTTP-Only Config
echo "--> Creating temporary HTTP-only Nginx config..."
cat > "$TEMP_CONF" <<EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 200 'SnapBuy is initializing SSL certificates. Please wait...';
        add_header Content-Type text/plain;
    }
}
EOF

# 3. Start Nginx with Temp Config
echo "--> Starting Nginx in HTTP validation mode..."
docker compose up -d nginx-proxy

echo "waiting for nginx to be ready..."
sleep 5

# 4. Request Certificates using Certbot
echo "--> Requesting Let's Encrypt Certificates..."
docker compose run --rm --entrypoint certbot certbot certonly --webroot --webroot-path=/var/www/certbot --email $EMAIL --agree-tos --no-eff-email --force-renewal -d $DOMAIN -d www.$DOMAIN

# 5. Restore Main Config
echo "--> Cleaning up temporary config..."
rm "$TEMP_CONF"

if [ -f "$MAIN_CONF.bak" ]; then
    echo "--> Restoring main Nginx config..."
    mv "$MAIN_CONF.bak" "$MAIN_CONF"
else
    echo "WARNING: Main config backup not found! You might need to git restore it."
fi

# 6. Restart Nginx with Full SSL Config
echo "--> Restarting Nginx with full SSL support..."
docker compose restart nginx-proxy

echo "========================================================"
echo "   SUCCESS! Website should be live at https://$DOMAIN"
echo "========================================================"
