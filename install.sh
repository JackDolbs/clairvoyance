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

# Install Docker if not present
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com | sh
fi

# Run the container
docker run -d \
  --name clairvoyance \
  -p 5174:5174 \
  -p 8090:8090 \
  -v clairvoyance_data:/app/data \
  jackdolbs/clairvoyance:latest

# Show access information
echo -e "${GREEN}Installation complete!${NC}"
IP=$(curl -s -4 ifconfig.me)
echo -e "${GREEN}Access your instance at http://$IP:5174${NC}"
echo -e "${GREEN}Admin interface at http://$IP:8090/_/${NC}"
echo -e "${YELLOW}Admin credentials:${NC}"
echo -e "Email: admin@clairvoyance.local"
echo -e "Password: securepassword123" 