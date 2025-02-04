import PocketBase from 'pocketbase';
import { listBackups } from './backup';

const pb = new PocketBase('http://127.0.0.1:8090');

export interface PocketBaseStatus {
    isRunning: boolean;
    version: string;
    collections: string[];
    lastBackup?: Date;
}

// Initialize PocketBase with default settings
export async function initializePocketBase() {
    try {
        // First check if PocketBase is running
        const health = await pb.health.check();
        console.log('PocketBase health check:', health);

        // Try to authenticate as admin
        console.log('Attempting admin authentication...');
        try {
            // Use the correct admin authentication endpoint
            const authData = await pb.send('/api/admins/auth-with-password', {
                method: 'POST',
                body: {
                    identity: 'admin@clairvoyance.local',
                    password: 'securepassword123'
                }
            });
            pb.authStore.save(authData.token, authData.admin);
        } catch (authError) {
            console.error('Admin authentication failed:', authError);
            
            // If authentication failed, try to create the admin account
            console.log('Attempting to create admin account...');
            await pb.send('/api/admins', {
                method: 'POST',
                body: {
                    email: 'admin@clairvoyance.local',
                    password: 'securepassword123',
                    passwordConfirm: 'securepassword123'
                }
            });
            
            // Try authentication again
            const authData = await pb.send('/api/admins/auth-with-password', {
                method: 'POST',
                body: {
                    identity: 'admin@clairvoyance.local',
                    password: 'securepassword123'
                }
            });
            pb.authStore.save(authData.token, authData.admin);
        }

        // Verify we're authenticated
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
        const collections = await pb.collections.getFullList();
        
        return {
            isRunning: true,
            version: health.code.toString(), // Convert number to string
            collections: collections.map(c => c.name),
            lastBackup: await getLastBackupDate()
        };
    } catch (err) {
        return {
            isRunning: false,
            version: 'unknown',
            collections: []
        };
    }
}

// Get last backup date
async function getLastBackupDate(): Promise<Date | undefined> {
    try {
        const backups = await listBackups();
        return backups.length > 0 ? new Date(backups[0].created) : undefined;
    } catch {
        return undefined;
    }
}

// Add this function to test connectivity
export async function testPocketBaseConnection(): Promise<boolean> {
    try {
        const health = await pb.health.check();
        console.log('PocketBase health check:', health);
        
        const collections = await pb.collections.getFullList();
        console.log('Available collections:', collections.map(c => c.name));
        
        return true;
    } catch (err) {
        console.error('PocketBase connection test failed:', err);
        return false;
    }
}

export { pb }; 