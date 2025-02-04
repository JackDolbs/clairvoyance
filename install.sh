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

# Check and install dependencies
echo -e "${YELLOW}Checking system requirements...${NC}"

# Detect OS
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$NAME
elif [ -f /etc/debian_version ]; then
    OS="Debian"
elif [ -f /etc/redhat-release ]; then
    OS="Red Hat"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    OS="macOS"
else
    echo -e "${RED}Unable to detect operating system${NC}"
    exit 1
fi

echo -e "${GREEN}Detected OS: $OS${NC}"

# Install dependencies based on OS
case "$OS" in
    *"Ubuntu"*|*"Debian"*)
        echo -e "${YELLOW}Installing dependencies for Debian/Ubuntu...${NC}"
        sudo apt-get update
        sudo apt-get install -y git nodejs npm curl
        ;;
    *"Red Hat"*|*"CentOS"*)
        echo -e "${YELLOW}Installing dependencies for RHEL/CentOS...${NC}"
        sudo yum install -y git nodejs npm curl
        ;;
    *"macOS"*)
        echo -e "${YELLOW}Installing dependencies for macOS...${NC}"
        if ! command_exists brew; then
            echo -e "${YELLOW}Installing Homebrew...${NC}"
            /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
        fi
        brew install git node
        ;;
    *)
        echo -e "${RED}Unsupported operating system: $OS${NC}"
        exit 1
        ;;
esac

# Verify dependencies
echo -e "${YELLOW}Verifying dependencies...${NC}"
for cmd in git node npm; do
    if ! command_exists $cmd; then
        echo -e "${RED}$cmd is not installed${NC}"
        exit 1
    fi
done

# Clone repository
echo -e "${YELLOW}Cloning Clairvoyance repository...${NC}"
if [ -d "clairvoyance" ]; then
    echo -e "${YELLOW}Existing installation found. Removing...${NC}"
    rm -rf clairvoyance
fi

git clone https://github.com/JackDolbs/clairvoyance.git
cd clairvoyance

# Make deploy script executable
chmod +x deploy.sh

# Run deployment script
echo -e "${YELLOW}Running deployment script...${NC}"
./deploy.sh

echo -e "${GREEN}Installation complete!${NC}"
echo -e "${GREEN}Access your instance at http://localhost:5173${NC}"
echo -e "${GREEN}Admin interface available at http://127.0.0.1:8090/_/${NC}" 