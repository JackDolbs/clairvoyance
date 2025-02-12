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

#### Why This Matters
Your application stores data in two critical locations:
1. `pb_data/` - PocketBase's database and files
2. `data/ontology.db` - DuckDB ontology database

**Without proper configuration, these will be deleted every time you:**
- Redeploy the app
- Restart the container
- Update dependencies

#### Step-by-Step Configuration
1. **In Coolify's Dashboard:**
   - Go to your application's settings
   - Find "Volumes" or "Persistent Storage"
   - Add these two entries:
   
     | Container Path      | Host Path              |
     |---------------------|------------------------|
     | `/app/pb_data`     | `/pb_data`             |
     | `/app/data`         | `/ontology_data`       |

2. **In Your Local `.gitignore**:
   ```gitignore
   # Database files
   /pb_data/
   /data/
   ```

#### Verification After Deployment
1. **Check Volume Mounts:**
   ```bash
   # Get container ID
   docker ps

   # Inspect mounts
   docker inspect <container-id> | grep Mounts
   ```

2. **Verify Database Files Exist:**
   ```bash
   docker exec -it <container-id> ls /app/data
   # Should show: ontology.db

   docker exec -it <container-id> ls /app/pb_data
   # Should show: data.db, backups, etc.
   ```

### Security Notes

1. Change the default admin password after first login
2. Keep your `VITE_AUTH_PIN` secure
3. Consider setting up SSL/TLS through Coolify
4. Regularly update dependencies with `npm audit fix`