import PocketBase from 'pocketbase';
import { browser } from '$app/environment';

// Create PocketBase instance based on environment
const pb = new PocketBase(
    browser 
        ? window.location.origin + '/pb'  // Use proxy in browser
        : process.env.POCKETBASE_URL || 'http://127.0.0.1:8090' // Direct in SSR
);

// Export both as default and named export
export default pb;
export { pb };

// Use environment-aware URL for internal server calls
const getInternalPocketBaseUrl = () => {
    // Always use direct localhost for server-side calls
    return 'http://localhost:8090';
}

// Use environment-aware URL for client calls
const getPocketBaseUrl = () => {
    if (process.env.NODE_ENV === 'production') {
        // Use proxy route in production
        return '/pb';
    }
    // Development: direct connection
    return 'http://localhost:8090';
}

// Helper function to wait for PocketBase with exponential backoff
async function waitForPocketBase(maxAttempts = 10) {
    for (let i = 0; i < maxAttempts; i++) {
        try {
            // Use internal URL for server-side health checks
            const response = await fetch(getInternalPocketBaseUrl() + '/api/health');
            const health = await response.json();
            
            if (health.code === 200) {
                console.log('PocketBase health check:', health);
                return true;
            }
            throw new Error('Health check failed');
        } catch (err) {
            console.log(`Attempt ${i + 1}: PocketBase not ready, waiting...`);
            await new Promise(resolve => setTimeout(resolve, Math.min(1000 * Math.pow(2, i), 10000)));
        }
    }
    return false;
}

// Add retry logic for admin creation
async function tryAdminCreation(attempts = 3) {
    for (let i = 0; i < attempts; i++) {
        try {
            const response = await fetch(getInternalPocketBaseUrl() + '/api/admins', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: 'admin@clairvoyance.local',
                    password: 'securepassword123',
                    passwordConfirm: 'securepassword123'
                })
            });

            const data = await response.json();

            if (response.status === 401) {
                return { success: true, exists: true };
            } else if (response.ok) {
                return { success: true, exists: false };
            }

            // If failed, wait before retry
            await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (err) {
            console.error(`Attempt ${i + 1} failed:`, err);
            if (i === attempts - 1) throw err;
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
    throw new Error('All admin creation attempts failed');
}

// Initialize database with configuration collections
export async function initializePocketBase(isBuild = false) {
    try {
        if (isBuild) {
            console.log('Skipping PocketBase initialization during build');
            return true;
        }
        console.log('Starting PocketBase initialization...');
        
        // Wait for PocketBase to be ready
        if (!await waitForPocketBase()) {
            throw new Error('PocketBase not available after maximum attempts');
        }

        // Try to create first admin
        try {
            const response = await fetch(getInternalPocketBaseUrl() + '/api/admins', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: 'admin@clairvoyance.local',
                    password: 'securepassword123',
                    passwordConfirm: 'securepassword123'
                })
            });

            const data = await response.json();

            if (response.status === 401) {
                // Expected when admin exists
                console.log('Admin exists, proceeding with authentication...');
            } else if (response.status === 400) {
                // Log the actual error
                console.log('Admin creation response:', data);
            } else if (!response.ok) {
                throw new Error(`Admin creation failed: ${data.message}`);
            } else {
                console.log('Admin created successfully');
            }

        } catch (err) {
            if (err.message?.includes('401')) {
                console.log('Admin exists (expected)');
            } else {
                console.error('Admin creation error:', err);
            }
        }

        // Try authentication
        try {
            const authResponse = await fetch(getInternalPocketBaseUrl() + '/api/admins/auth-with-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    identity: 'admin@clairvoyance.local',
                    password: 'securepassword123'
                })
            });

            const authData = await authResponse.json();

            if (!authResponse.ok) {
                throw new Error(`Auth failed: ${authData.message}`);
            }

            console.log('Admin authentication successful');
            return true;
        } catch (err) {
            console.error('Auth error:', err);
            return false;
        }
    } catch (err) {
        console.error('Initialization error:', err);
        return false;
    }
}

// Simple status check
export async function getPocketBaseStatus() {
    try {
        // Use fetch instead of SDK
        const response = await fetch(getPocketBaseUrl() + '/api/health');
        const health = await response.json();
        return health?.code === 200;
    } catch {
        return false;
    }
}

// Update this function to be more thorough
export async function testPocketBaseConnection() {
    try {
        const response = await fetch(getPocketBaseUrl() + '/api/health');
        const health = await response.json();
        console.log("PocketBase health check response:", JSON.stringify(health, null, 2));
        return health?.code === 200;
    } catch (err) {
        console.error('Connection test failed:', err);
        return false;
    }
} 