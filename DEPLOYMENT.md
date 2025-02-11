# Deployment Guide

## Deploying to Coolify

### Prerequisites

1. A running Coolify instance
2. Your repository connected to Coolify
3. Admin access to Coolify

### Deployment Steps

1. **Create New Service in Coolify**
   - Select "Application"
   - Choose "Git Source"
   - Select your repository
   - Choose "Node.js" as the type

2. **Configure Build Settings**
   ```yaml
   Start Command: node build
   Port: 3000
   ```

3. **Add Environment Variables**
   ```env
   NODE_ENV=production
   POCKETBASE_URL=http://localhost:8090
   VITE_AUTH_PIN=your_chosen_pin
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for the build and deployment to complete

### Verification

1. Once deployed, your application will be available at the provided Coolify URL
2. The PocketBase admin interface will be available at `your-app-url/pb/_/`
3. Test the application by:
   - Creating an admin account
   - Logging in with your PIN
   - Verifying API endpoints work through the proxy

### Troubleshooting

If you encounter issues:

1. **Build Fails**
   - Check the build logs in Coolify
   - Ensure all environment variables are set correctly
   - Verify Node.js version is set to 18

2. **PocketBase Not Starting**
   - Check the application logs in Coolify
   - Verify the PocketBase binary was downloaded successfully
   - Ensure port 8090 is available

3. **Cannot Access Admin UI**
   - Verify the proxy configuration in `src/routes/pb/[...path]/+server.ts`
   - Check network access to port 8090
   - Ensure PocketBase is running (check logs)

### Data Persistence

PocketBase data is stored in the `pb_data` directory. To persist data between deployments:

1. Add a volume in Coolify for `/app/pb_data`
2. Configure backup strategy for the volume
3. Ensure `pb_data` is in your `.gitignore`

### Security Notes

1. Change the default admin password after first login
2. Keep your `VITE_AUTH_PIN` secure
3. Consider setting up SSL/TLS through Coolify
4. Regularly update dependencies with `npm audit fix`

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