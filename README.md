# Clairvoyance

A self-hosted AI chat interface with local database management.

## Quick Install

```bash
curl -fsSL https://raw.githubusercontent.com/JackDolbs/clairvoyance/main/install.sh | bash
```

This will:
- Install required dependencies
- Clone the repository
- Set up the database
- Start the application

### VPS Deployment
1. SSH into your VPS
2. Run the install command above
3. Access your instance at `http://your-vps-ip:5173`

## Deployment

### Requirements
- Linux/macOS system
- Node.js and npm installed
- Internet connection for initial setup

### Quick Start
1. Clone this repository
```bash
git clone https://github.com/JackDolbs/clairvoyance.git
cd clairvoyance
```

2. Run the deployment script
```bash
./deploy.sh
```

The script will:
- Download and set up PocketBase database
- Initialize admin account
- Start the database service
- Launch the application

### What's Included
- Local database (PocketBase)
- Admin interface at `http://127.0.0.1:8090/_/`
- Configuration UI
- Automatic database initialization

### Architecture
- Frontend: SvelteKit application
- Backend: PocketBase database
- All components run on the same machine
- No external services required

## Development

Once deployed, start the development server:

```bash
npm run dev -- --open
```

## Building

To create a production version:

```bash
npm run build
```

Preview the production build with `npm run preview`.
