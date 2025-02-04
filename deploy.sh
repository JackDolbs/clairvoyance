#!/bin/bash

# Set up directories in the project folder instead of /opt
APP_DIR="./data"
PB_DIR="$APP_DIR/pocketbase"
PB_BINARY="$PB_DIR/pocketbase"
PB_DATA="$PB_DIR/pb_data"
BACKUP_DIR="$APP_DIR/backups"

# Add this near the start of the script
echo "Checking for existing PocketBase process..."

# Try multiple ways to find and stop PocketBase
pkill -f pocketbase
pkill pocketbase

# Check if port 8090 is in use
if lsof -i:8090 > /dev/null 2>&1; then
    echo "Port 8090 is still in use. Finding process..."
    lsof -i:8090
    echo "Please manually kill the process and try again"
    exit 1
fi

# Small wait to ensure port is freed
sleep 2

echo "Starting deployment..."
echo "Creating directories..."
mkdir -p $APP_DIR $PB_DIR $PB_DATA $BACKUP_DIR

# Detect OS and architecture
OS="$(uname -s)"
ARCH="$(uname -m)"

# Set the correct PocketBase download URL based on OS and architecture
PB_VERSION="0.16.10"
case "${OS}" in
    "Darwin")
        case "${ARCH}" in
            "arm64")
                PB_FILE="pocketbase_${PB_VERSION}_darwin_arm64.zip"
                ;;
            "x86_64")
                PB_FILE="pocketbase_${PB_VERSION}_darwin_amd64.zip"
                ;;
        esac
        ;;
    "Linux")
        case "${ARCH}" in
            "x86_64")
                PB_FILE="pocketbase_${PB_VERSION}_linux_amd64.zip"
                ;;
            "aarch64")
                PB_FILE="pocketbase_${PB_VERSION}_linux_arm64.zip"
                ;;
        esac
        ;;
    *)
        echo "Unsupported operating system: ${OS}"
        exit 1
        ;;
esac

echo "System detected: ${OS} ${ARCH}"
echo "Using PocketBase file: ${PB_FILE}"

# Clean up any existing files
rm -f "$PB_DIR/pocketbase.zip" "$PB_BINARY"

# Download and extract PocketBase
echo "Downloading PocketBase v${PB_VERSION} for ${OS} ${ARCH}..."
curl -L -o "$PB_DIR/pocketbase.zip" "https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/${PB_FILE}"
if [ $? -ne 0 ]; then
    echo "Failed to download PocketBase. Please check your internet connection."
    exit 1
fi

echo "Extracting PocketBase..."
cd "$PB_DIR"
unzip -o "pocketbase.zip"
if [ $? -ne 0 ]; then
    echo "Failed to extract PocketBase."
    exit 1
fi

# Make sure the binary exists and is executable
if [ ! -f "./pocketbase" ]; then
    echo "PocketBase binary not found after extraction."
    ls -la
    exit 1
fi

chmod +x "./pocketbase"
if [ $? -ne 0 ]; then
    echo "Failed to make PocketBase executable."
    exit 1
fi

echo "Starting PocketBase..."
./pocketbase serve --http="127.0.0.1:8090" --dir="$PB_DATA" &
PB_PID=$!

# Wait for PocketBase to start
echo "Waiting for PocketBase to start..."
sleep 5

# Check if PocketBase is running
if ! kill -0 $PB_PID 2>/dev/null; then
    echo "Failed to start PocketBase. Check the logs for details."
    ps aux | grep pocketbase
    exit 1
fi

# Initialize admin account if this is the first run
if [ ! -f "$PB_DATA/.initialized" ]; then
    echo "First run detected - creating admin account..."
    
    # Try to create admin account
    RESPONSE=$(curl -s -X POST http://127.0.0.1:8090/api/admins -H "Content-Type: application/json" -d '{
        "email": "admin@clairvoyance.local",
        "password": "securepassword123",
        "passwordConfirm": "securepassword123"
    }')
    
    # Check if the response contains an ID (success) or error message
    if echo "$RESPONSE" | grep -q "id"; then
        echo "Admin account created successfully"
        echo "Testing admin authentication..."
        
        # Test authentication with correct field names
        AUTH_RESPONSE=$(curl -s -X POST http://127.0.0.1:8090/api/admins/auth-with-password -H "Content-Type: application/json" -d '{
            "identity": "admin@clairvoyance.local",
            "password": "securepassword123"
        }')
        
        if echo "$AUTH_RESPONSE" | grep -q "token"; then
            echo "Admin authentication successful"
            touch "$PB_DATA/.initialized"
        else
            echo "Failed to authenticate admin. Response: $AUTH_RESPONSE"
            exit 1
        fi
    else
        echo "Failed to create admin account. Response: $RESPONSE"
        exit 1
    fi
fi

echo "PocketBase started successfully (PID: $PB_PID)"

# Change back to original directory
cd - > /dev/null

# For development, start the Vite dev server
echo "Starting development server..."
npm run dev -- --open

# Trap SIGINT and SIGTERM signals and exit
trap "kill $PB_PID" SIGINT SIGTERM EXIT 