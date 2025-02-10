# Deployment Guides

## Coolify Deployment

### Prerequisites
- A Coolify instance
- Git repository access

### Steps
1. Fork this repository
2. In Coolify dashboard:
   - Create new service
   - Select your fork
   - Configure build settings:
     ```
     Build Command: npm run build
     Start Command: npm run preview
     ```
   - Set environment variables:
     ```
     VITE_AUTH_PIN=your_chosen_pin
     ```
   - Deploy

### Troubleshooting
- Ensure ports 5174 and 8090 are available
- Check Coolify logs if deployment fails
- Verify environment variables are set correctly

## Vercel Deployment

### Prerequisites
- Vercel account
- Git repository access

### Steps
1. Fork this repository
2. Import to Vercel:
   - Connect your GitHub account
   - Select the repository
   - Configure build settings:
     ```
     Framework Preset: SvelteKit
     Build Command: npm run build
     Output Directory: build
     ```
   - Add environment variables
   - Deploy

### Notes
- PocketBase requires serverless adaptation (coming soon)
- Use Vercel's edge functions for optimal performance 