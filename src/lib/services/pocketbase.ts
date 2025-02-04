import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

export interface PocketBaseStatus {
    isRunning: boolean;
    version: string;
    collections: string[];
}

// Initialize PocketBase with default settings
export async function initializePocketBase() {
    try {
        // First check if PocketBase is running
        const health = await pb.health.check();
        console.log('PocketBase health check:', health);

        // Use raw API endpoint for admin auth
        const authData = await pb.send('/api/admins/auth-with-password', {
            method: 'POST',
            body: {
                identity: 'admin@clairvoyance.local',
                password: 'securepassword123'
            }
        });
        
        pb.authStore.save(authData.token, authData.admin);

        if (!pb.authStore.isValid) {
            throw new Error('Authentication failed');
        }

        console.log('Successfully authenticated as admin');

        // Create collections if they don't exist
        const collections = await pb.collections.getFullList();
        if (!collections.find(c => c.name === 'instance_settings')) {
            console.log('Creating instance_settings collection...');
            await pb.collections.create({
                name: 'instance_settings',
                type: 'base',
                schema: [
                    { name: 'instance_name', type: 'text' },
                    { name: 'instance_url', type: 'text' },
                    { name: 'theme', type: 'json' }
                ]
            });
        }

        // Add more collections as needed...

        console.log('PocketBase initialized successfully');
        return true;
    } catch (err) {
        console.error('Error initializing PocketBase:', err);
        return false;
    }
}

// Get PocketBase status
export async function getPocketBaseStatus(): Promise<PocketBaseStatus> {
    try {
        const health = await pb.health.check();
        
        // Use raw API endpoint if needed
        if (!pb.authStore.isValid) {
            const authData = await pb.send('/api/admins/auth-with-password', {
                method: 'POST',
                body: {
                    identity: 'admin@clairvoyance.local',
                    password: 'securepassword123'
                }
            });
            pb.authStore.save(authData.token, authData.admin);
        }
        
        const collections = await pb.collections.getFullList();
        
        return {
            isRunning: true,
            version: health.code.toString(),
            collections: collections.map(c => c.name),
        };
    } catch (err) {
        console.error('Failed to get PocketBase status:', err);
        return {
            isRunning: false,
            version: 'unknown',
            collections: []
        };
    }
}

// Add this function to test connectivity
export async function testPocketBaseConnection(): Promise<boolean> {
    try {
        // First check basic health
        const health = await pb.health.check();
        console.log('PocketBase health check:', health);
        
        // Use raw API endpoint for admin auth
        const authData = await pb.send('/api/admins/auth-with-password', {
            method: 'POST',
            body: {
                identity: 'admin@clairvoyance.local',
                password: 'securepassword123'
            }
        });
        
        pb.authStore.save(authData.token, authData.admin);
        
        if (!pb.authStore.isValid) {
            console.error('Admin authentication failed: Invalid auth state');
            return false;
        }
        
        // Now try to list collections (requires admin auth)
        const collections = await pb.collections.getFullList();
        console.log('Available collections:', collections.map(c => c.name));
        
        return true;
    } catch (err) {
        console.error('PocketBase connection test failed:', err);
        return false;
    }
}

export { pb }; 