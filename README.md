# Clairvoyance

A self-hosted AI chat interface with local database management, built with SvelteKit and PocketBase.

## Features
- Custom analytics dashboards
- AI-powered chat insights
- Knowledge graph visualization
- Local database management
- PIN-based authentication

## Development

```bash
# Clone the repository
git clone https://github.com/yourusername/clairvoyance.git
cd clairvoyance

# Install dependencies
npm install

# Start development server
npm run dev
```

## Deployment
We support multiple deployment platforms. Choose the one that works best for you:

### Quick Deploy
[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyourusername%2Fclairvoyance)
[![Deploy to Coolify](https://coolify.io/button)](https://coolify.io/docs/deploy)

### Manual Deploy
See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed platform-specific guides.

## Environment Variables
```env
# Required
VITE_AUTH_PIN=1234    # Your chosen 4-digit PIN for authentication

# Optional
NODE_ENV=production   # Set by deployment platform
```

## Status
This project is in pre-alpha. Expect frequent changes and updates.
