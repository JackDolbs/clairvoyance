import { startPocketBase, createPocketBaseServer } from '$lib/server/pocketbase';
import type { Handle } from '@sveltejs/kit';
import { building } from '$app/environment';

// Initialize PocketBase on server start
if (!building && !global.__pocketbaseStarted) {
    console.log('Starting PocketBase from hooks...');
    startPocketBase();
    global.__pocketbaseStarted = true;
}

export const handle: Handle = async ({ event, resolve }) => {
    try {
        // Skip PocketBase handling during build
        if (building) {
            return await resolve(event);
        }

        console.log('Handling request:', {
            url: event.url.pathname,
            method: event.request.method
        });

        // Create a new PocketBase instance for each request
        event.locals.pb = createPocketBaseServer();

        // Load auth data from cookies if available
        const cookie = event.request.headers.get('cookie') || '';
        event.locals.pb.authStore.loadFromCookie(cookie);

        try {
            // Refresh auth if needed
            if (event.locals.pb.authStore.isValid) {
                await event.locals.pb.collection('users').authRefresh();
            }
        } catch (err) {
            console.log('Auth refresh failed:', err);
            event.locals.pb.authStore.clear();
        }

        const response = await resolve(event);

        // Set auth cookie in response
        response.headers.set('set-cookie', event.locals.pb.authStore.exportToCookie());

        return response;
    } catch (err) {
        console.error('Hook error:', {
            error: err instanceof Error ? err.message : String(err),
            stack: err instanceof Error ? err.stack : undefined,
            url: event.url.pathname,
            method: event.request.method
        });
        
        return await resolve(event);
    }
}; 