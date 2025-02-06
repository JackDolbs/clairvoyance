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

# Start frontend with explicit network binding
echo "Starting frontend..."
exec npm run preview -- --port 5174 --host --strictPort

# If Vite exits, kill PocketBase
kill $PB_PID 