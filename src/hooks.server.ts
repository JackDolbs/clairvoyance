import { startPocketBase } from '$lib/server/pocketbase';
import { initializePocketBase } from '$lib/services/pocketbase';
import { building } from '$app/environment';

// Initialize on server start
export async function handle({ event, resolve }) {
    try {
        // Skip everything during build
        if (building) {
            return await resolve(event);
        }

        // Start PocketBase if not running
        if (!global.__pocketbaseStarted) {
            console.log('Starting PocketBase from hooks...');
            startPocketBase();
            // Initial delay for process to start
            await new Promise(resolve => setTimeout(resolve, 2000));
            global.__pocketbaseStarted = true;
        }

        // Initialize database if needed
        if (!global.__pocketbaseInitialized) {
            const success = await initializePocketBase();
            if (success) {
                global.__pocketbaseInitialized = true;
            }
        }
    } catch (err) {
        console.error('Hook error:', err);
    }

    return await resolve(event);
} 