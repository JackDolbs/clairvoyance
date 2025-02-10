# Clairvoyance

A self-contained, self-hosted AI chat interface built with SvelteKit and PocketBase.

## Features
- Custom analytics dashboards
- AI-powered chat insights
- Knowledge graph visualization
- Self-contained database
- PIN-based authentication

## How It Works
Each Clairvoyance deployment is completely self-contained:
- Your own PocketBase instance
- Private data storage
- Dedicated admin interface
- Automatic initialization

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

> ⚠️ **Note**: Currently only supports deployment via Coolify
> 
> Each deployment creates an isolated instance with its own database and storage.
> See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed setup instructions.

## Environment Variables
```env
# Required
VITE_AUTH_PIN=1234    # Your chosen 4-digit PIN for authentication

# Optional
NODE_ENV=production   # Set by deployment platform
```

## Status
This project is in pre-alpha. Expect frequent changes and updates.
