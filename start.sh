#!/bin/bash

# Start PocketBase
./data/pocketbase/pocketbase serve --http="0.0.0.0:8090" --dir="./data/pocketbase/pb_data" &

# Start Vite
npm run build
npm run preview -- --host 0.0.0.0 --port 5174 