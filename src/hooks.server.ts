import { startPocketBase } from '$lib/server/pocketbase';
import { initializePocketBase } from '$lib/services/pocketbase';

// Initialize on server start
export async function handle({ event, resolve }) {
    // Start PocketBase if not running
    if (!global.__pocketbaseStarted) {
        startPocketBase();
        global.__pocketbaseStarted = true;
    }

    // Initialize database if needed
    if (!global.__pocketbaseInitialized) {
        await initializePocketBase();
        global.__pocketbaseInitialized = true;
    }

    return resolve(event);
} 