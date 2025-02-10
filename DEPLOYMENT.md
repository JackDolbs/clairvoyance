# Deployment Guide

Currently, Clairvoyance only supports deployment via Coolify due to PocketBase requirements.

## Coolify Deployment

### Prerequisites
- A Coolify instance
- Git repository access

### What You Get
Each Coolify deployment creates an isolated instance with:
- Your own PocketBase database
- Dedicated admin interface
- Private data storage
- Secure authentication

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
     NODE_ENV=production
     ```
   - Deploy

### Data Persistence
- PocketBase data is stored in `pb_data` directory
- Each deployment gets its own storage volume
- Data persists across restarts
- Backups can be managed via PocketBase admin UI

### Initial Setup
On first deployment:
1. PocketBase initializes automatically
2. Default admin account is created
3. Database schema is configured
4. You can access admin UI at `your-domain:8090/_/`

### Troubleshooting
- Ensure ports 5174 (frontend) and 8090 (PocketBase) are available
- Check Coolify logs if deployment fails
- Verify PocketBase is running via health check at `/api/health`

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

### PocketBase Data
The `pb_data` directory will be created in:
- Development: Project root
- Coolify: Container volume
- Vercel: Ephemeral storage (needs adaptation) 