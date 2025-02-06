# Build stage
FROM node:18-slim as build

WORKDIR /app

# Install build dependencies with retry mechanism
RUN echo "deb http://ftp.uk.debian.org/debian/ bookworm main" > /etc/apt/sources.list && \
    echo "deb http://ftp.uk.debian.org/debian/ bookworm-updates main" >> /etc/apt/sources.list && \
    echo "deb http://security.debian.org/debian-security bookworm-security main" >> /etc/apt/sources.list && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* && \
    mkdir -p /var/lib/apt/lists/partial && \
    for i in $(seq 1 3); do \
        apt-get update --fix-missing && \
        apt-get install -y --no-install-recommends \
            curl \
            unzip \
            ca-certificates \
            git \
            procps \
            net-tools && \
        rm -rf /var/lib/apt/lists/* && \
        break || \
        if [ $i -lt 3 ]; then \
            sleep 5; \
            continue; \
        fi; \
        exit 1; \
    done

# Download PocketBase based on architecture
RUN ARCH=$(uname -m) && \
    if [ "$ARCH" = "aarch64" ] || [ "$ARCH" = "arm64" ]; then \
        curl -L https://github.com/pocketbase/pocketbase/releases/download/v0.16.10/pocketbase_0.16.10_linux_arm64.zip -o pb.zip; \
    else \
        curl -L https://github.com/pocketbase/pocketbase/releases/download/v0.16.10/pocketbase_0.16.10_linux_amd64.zip -o pb.zip; \
    fi && \
    unzip pb.zip && \
    rm pb.zip && \
    chmod +x pocketbase

# Install app dependencies and build
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Runtime stage
FROM node:18-slim

WORKDIR /app

# Install runtime dependencies with retry mechanism
RUN echo "deb http://ftp.uk.debian.org/debian/ bookworm main" > /etc/apt/sources.list && \
    echo "deb http://ftp.uk.debian.org/debian/ bookworm-updates main" >> /etc/apt/sources.list && \
    echo "deb http://security.debian.org/debian-security bookworm-security main" >> /etc/apt/sources.list && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* && \
    mkdir -p /var/lib/apt/lists/partial && \
    for i in $(seq 1 3); do \
        apt-get update --fix-missing && \
        apt-get install -y --no-install-recommends \
            curl \
            git \
            procps \
            net-tools && \
        rm -rf /var/lib/apt/lists/* && \
        break || \
        if [ $i -lt 3 ]; then \
            sleep 5; \
            continue; \
        fi; \
        exit 1; \
    done

# Copy ALL files needed for production
COPY --from=build /app/build ./build
COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/pocketbase ./pocketbase
COPY --from=build /app/start.sh ./start.sh
COPY --from=build /app/.svelte-kit ./.svelte-kit
COPY --from=build /app/vite.config.ts ./
COPY --from=build /app/svelte.config.js ./

RUN chmod +x start.sh

EXPOSE 5174 8090

CMD ["./start.sh"]