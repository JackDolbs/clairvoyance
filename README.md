# Clairvoyance

A self-hosted AI chat interface with local database management.

## Quick Install

```bash
curl -fsSL https://raw.githubusercontent.com/JackDolbs/clairvoyance/main/install.sh | bash
```

This will:
- Install required dependencies
- Pull Docker image
- Start containerized application
- Set up persistent storage

### VPS Deployment
1. SSH into your VPS
2. Run the install command above
3. Access your instance at `http://your-vps-ip:5174`

## Deployment

### Requirements
- Docker installed

### What's Included
- Local database (PocketBase)
- Admin interface at `http://your-ip:8090/_/`
- Configuration UI
- Automatic database initialization

### Architecture
- Frontend: SvelteKit application
- Backend: PocketBase database
- Containerized deployment
- Docker-based installation
