#!/bin/bash

# Start PocketBase
./pocketbase serve --http="0.0.0.0:8090" --dir="./data/pocketbase/pb_data" &

# Start Vite
npm run dev -- --host 0.0.0.0 --port 5174 