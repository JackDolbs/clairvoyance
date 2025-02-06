import PocketBase from 'pocketbase';

// Single PocketBase instance
const pb = new PocketBase('http://localhost:8090');

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
            pbVersion = await fetch('http://localhost:8090/api/_').then(r => r.text());
            console.log('PocketBase version:', pbVersion);
        } catch (err) {
            console.log('Failed to get PocketBase version:', err);
        }

        console.log('PocketBase is ready, attempting admin setup...');

        // Try to create first admin
        try {
            console.log('Attempting to create first admin...');
            await fetch('http://localhost:8090/api/admins', {
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
            console.log('Admin created successfully');
        } catch (err) {
            // Ignore error if admin already exists
            console.log('Admin creation failed (might already exist):', err);
        }

        // Now try to authenticate using admin API
        try {
            console.log('Attempting admin authentication...');
            const authResponse = await fetch('http://localhost:8090/api/admins/auth-with-password', {
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