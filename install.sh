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
    # Install Docker's prerequisites
    sudo apt-get install -y git curl apt-transport-https ca-certificates software-properties-common
    
    # Add Docker's official GPG key
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
    
    # Add Docker repository
    sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
    
    # Install Docker
    sudo apt-get update
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
fi

# Clone and setup
git clone https://github.com/JackDolbs/clairvoyance.git
cd clairvoyance

# Start with Docker
docker-compose up -d

# Show access information
echo -e "${GREEN}Installation complete!${NC}"
IP=$(curl -s -4 ifconfig.me)
echo -e "${GREEN}Access your instance at http://$IP:5174${NC}"
echo -e "${GREEN}Admin interface at http://$IP:8090/_/${NC}"
echo -e "${YELLOW}Admin credentials:${NC}"
echo -e "Email: admin@clairvoyance.local"
echo -e "Password: securepassword123" 