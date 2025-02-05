# Build stage
FROM node:18 as build

WORKDIR /app
COPY . .
RUN npm install

# Runtime stage
FROM node:18-slim

WORKDIR /app
COPY --from=build /app .

# Download and setup PocketBase
RUN mkdir -p data/pocketbase && \
    cd data/pocketbase && \
    curl -L -o pb.zip https://github.com/pocketbase/pocketbase/releases/download/v0.16.10/pocketbase_0.16.10_linux_amd64.zip && \
    unzip pb.zip && \
    rm pb.zip && \
    chmod +x pocketbase

RUN chmod +x start.sh

EXPOSE 5174
EXPOSE 8090

CMD ["./start.sh"] 