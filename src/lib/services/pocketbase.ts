import PocketBase from 'pocketbase';

// Use environment-aware URL
const getPocketBaseUrl = () => {
    if (process.env.NODE_ENV === 'production') {
        // Always use the proxy route in production
        return '/pb';
    }
    // Development: direct connection
    return 'http://localhost:8090';
}

const pb = new PocketBase(getPocketBaseUrl());

// Add this variable to store version
let pbVersion = "Unknown";

// Helper function to wait for PocketBase
async function waitForPocketBase(maxAttempts = 5) {
    for (let i = 0; i < maxAttempts; i++) {
        try {
            const health = await pb.health.check();
            console.log('PocketBase health check:', health);
            return true;
        } catch (err) {
            console.log(`Attempt ${i + 1}: PocketBase not ready, waiting...`);
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
    return false;
}

// Initialize database with configuration collections
export async function initializePocketBase() {
    try {
        console.log('Starting PocketBase initialization...');
        
        // Wait for PocketBase to be ready
        if (!await waitForPocketBase()) {
            throw new Error('PocketBase not available after maximum attempts');
        }

        // Get PocketBase version
        try {
            pbVersion = await fetch(getPocketBaseUrl() + '/api/_').then(r => r.text());
            console.log('PocketBase version:', pbVersion);
        } catch (err) {
            console.log('Failed to get PocketBase version:', err);
        }

        console.log('PocketBase is ready, attempting admin setup...');

        // Try to create first admin
        try {
            console.log('Creating admin with URL:', getPocketBaseUrl() + '/api/admins');
            const response = await fetch(getPocketBaseUrl() + '/api/admins', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: 'admin@clairvoyance.local',
                    password: 'securepassword123',
                    passwordConfirm: 'securepassword123'
                })
            });
            
            console.log('Admin creation response:', {
                status: response.status,
                statusText: response.statusText,
                headers: Object.fromEntries(response.headers)
            });
            
            const responseText = await response.text();
            console.log('Response body:', responseText);
            
            // Add delay before authentication
            await new Promise(resolve => setTimeout(resolve, 1000));
            
        } catch (err) {
            // Ignore error if admin already exists
            console.log('Admin creation failed (might already exist):', err);
        }

        // Now try to authenticate using admin API
        try {
            console.log('Attempting admin authentication...');
            const authResponse = await fetch(getPocketBaseUrl() + '/api/admins/auth-with-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    identity: 'admin@clairvoyance.local',
                    password: 'securepassword123'
                })
            });

            if (!authResponse.ok) {
                throw new Error(`Auth failed with status ${authResponse.status}`);
            }

            const authData = await authResponse.json();
            console.log('Admin authentication successful:', authData);
            return true;
        } catch (err) {
            console.error('Admin authentication failed:', err);
            return false;
        }
    } catch (err) {
        console.error('Detailed initialization error:', err);
        return false;
    }
}

// Simple status check
export async function getPocketBaseStatus() {
    try {
        await pb.health.check();
        return true;
    } catch {
        return false;
    }
}

// Update this function to be more thorough
export async function testPocketBaseConnection() {
    try {
        const health = await pb.health.check();
        console.log("PocketBase health check response:", JSON.stringify(health, null, 2));
        return health && health.code === 200;
    } catch (err) {
        console.error('Connection test failed:', err);
        return false;
    }
}

// Add getter for version
export function getPocketBaseVersion() {
    return pbVersion;
}

export { pb }; 