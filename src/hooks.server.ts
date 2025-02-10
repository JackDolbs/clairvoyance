import { startPocketBase, createPocketBaseServer } from '$lib/server/pocketbase';
import type { Handle } from '@sveltejs/kit';
import { building } from '$app/environment';

// Initialize PocketBase on server start
if (!building && !global.__pocketbaseStarted) {
    console.log('=== Initializing PocketBase from hooks ===');
    console.log('Building:', building);
    console.log('PocketBase already started:', global.__pocketbaseStarted);
    
    try {
        startPocketBase();
        global.__pocketbaseStarted = true;
        console.log('PocketBase initialization complete');
    } catch (err) {
        console.error('Failed to initialize PocketBase:', err);
    }
}

export const handle: Handle = async ({ event, resolve }) => {
    try {
        console.log('=== Handling request ===');
        console.log('URL:', event.url.pathname);
        console.log('Method:', event.request.method);

        // Skip PocketBase handling during build
        if (building) {
            console.log('Skipping PocketBase handling during build');
            return await resolve(event);
        }

        // Create a new PocketBase instance for each request
        try {
            event.locals.pb = createPocketBaseServer();
            console.log('Created PocketBase instance for request');
        } catch (err) {
            console.error('Failed to create PocketBase instance:', err);
            throw err;
        }

        // Load auth data from cookies if available
        const cookie = event.request.headers.get('cookie') || '';
        console.log('Request cookie:', cookie);
        
        try {
            event.locals.pb.authStore.loadFromCookie(cookie);
            console.log('Auth store loaded from cookie');
        } catch (err) {
            console.error('Failed to load auth store from cookie:', err);
        }

        try {
            if (event.locals.pb.authStore.isValid) {
                await event.locals.pb.collection('users').authRefresh();
                console.log('Auth refreshed successfully');
            }
        } catch (err) {
            console.log('Auth refresh failed:', err);
            event.locals.pb.authStore.clear();
        }

        const response = await resolve(event);
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