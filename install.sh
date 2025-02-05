#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Error handling
set -e
trap 'catch $? $LINENO' ERR

catch() {
    echo -e "${RED}Error $1 occurred on line $2${NC}"
    exit 1
}

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

echo -e "${GREEN}Starting Clairvoyance installation...${NC}"

# Install dependencies
if command -v apt-get &> /dev/null; then
    sudo apt-get update
    sudo apt-get install -y git nodejs npm curl unzip ufw
fi

# Configure firewall
echo -e "${YELLOW}Configuring firewall...${NC}"
sudo ufw allow ssh
sudo ufw allow 22
sudo ufw allow 5174
sudo ufw allow 8090
if sudo ufw status | grep -q "22/tcp.*ALLOW"; then
    sudo ufw --force enable
else
    echo -e "${RED}Warning: SSH port not properly configured in firewall. Skipping firewall enable.${NC}"
fi

# Clone and setup
git clone https://github.com/JackDolbs/clairvoyance.git
cd clairvoyance

# Install project dependencies
npm install

# Start PocketBase in background
./deploy.sh &

# Wait for PocketBase to be ready
sleep 10

# Start the development server in background
sudo npm install -g pm2
pm2 start "npm run dev -- --host 0.0.0.0 --port 5174" --name "clairvoyance" --no-daemon

# Show access information
echo -e "${GREEN}Installation complete!${NC}"
IP=$(curl -s -4 ifconfig.me)
echo -e "${GREEN}Access your instance at http://$IP:5174${NC}"
echo -e "${GREEN}Admin interface at http://$IP:8090/_/${NC}"
echo -e "${YELLOW}Admin credentials:${NC}"
echo -e "Email: admin@clairvoyance.local"
echo -e "Password: securepassword123" 