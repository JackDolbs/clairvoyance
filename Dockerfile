# Build stage
FROM node:18 as build

WORKDIR /app
COPY . .
RUN npm install

# Download and setup PocketBase in build stage
RUN set -x && \
    mkdir -p data/pocketbase && \
    cd data/pocketbase && \
    curl -L -v -o pb.zip https://github.com/pocketbase/pocketbase/releases/download/v0.16.10/pocketbase_0.16.10_linux_amd64.zip && \
    unzip -o pb.zip && \
    rm pb.zip && \
    chmod +x ./pocketbase

# Runtime stage
FROM node:18-slim

WORKDIR /app

# Install git for Vite with retry mechanism
RUN apt-get clean && \
    rm -rf /var/lib/apt/lists/* && \
    apt-get update --fix-missing && \
    apt-get install -y git && \
    rm -rf /var/lib/apt/lists/*

COPY --from=build /app .

RUN chmod +x start.sh

EXPOSE 5174
EXPOSE 8090

CMD ["./start.sh"] 