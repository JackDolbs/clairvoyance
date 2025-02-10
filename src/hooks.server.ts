import { startPocketBase } from '$lib/server/pocketbase';
import { initializePocketBase } from '$lib/services/pocketbase';
import { building } from '$app/environment';

// Initialize on server start
export async function handle({ event, resolve }) {
    try {
        // Start PocketBase if not running
        if (!global.__pocketbaseStarted) {
            if (!building) {
                console.log('Starting PocketBase from hooks...');
                startPocketBase();
                // Add delay to ensure server is ready
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
            global.__pocketbaseStarted = true;
        }

        // Initialize database if needed
        if (!global.__pocketbaseInitialized) {
            const success = await initializePocketBase();
            if (!success) {
                console.error('PocketBase initialization failed');
            }
            global.__pocketbaseInitialized = true;
        }
    } catch (err) {
        console.error('Hook error:', err);
    }

    return await resolve(event);
} 