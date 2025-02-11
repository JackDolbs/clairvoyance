# Clairvoyance

A SvelteKit application with integrated PocketBase backend.

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

1. Clone the repository:
```bash
git clone https://github.com/JackDolbs/clairvoyance.git
cd clairvoyance
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file:
```env
POCKETBASE_URL=http://localhost:8090
VITE_AUTH_PIN=your_chosen_pin
```

4. Start the development server:
```bash
npm run dev
```

This will:
- Download PocketBase automatically
- Start PocketBase on port 8090
- Start SvelteKit development server
- Open http://localhost:5173 in your browser

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for deployment instructions.

## Environment Variables
```env
# Required
VITE_AUTH_PIN=1234    # Your chosen 4-digit PIN for authentication

# Optional
NODE_ENV=production   # Set by deployment platform
```

## Status
This project is in pre-alpha. Expect frequent changes and updates.
