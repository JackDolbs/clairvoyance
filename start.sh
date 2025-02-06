#!/bin/bash

# Start PocketBase
./pocketbase serve --http="0.0.0.0:8090" --dir="./pb_data" &
PB_PID=$!

# Wait for PocketBase to start...
echo "Waiting for PocketBase to start..."
until curl -s http://localhost:8090/api/health > /dev/null; do
    sleep 1
done
echo "PocketBase is ready"

# Start frontend
echo "Starting frontend..."
NODE_ENV=production npm run preview -- --host 0.0.0.0 --port 5174 --strictPort

# If Vite exits, kill PocketBase
kill $PB_PID 