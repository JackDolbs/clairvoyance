import { createPocketBaseServer } from '$lib/server/pocketbase';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
    try {
        // Create a new PocketBase instance for each request
        event.locals.pb = createPocketBaseServer();

        // Load auth data from cookies if available
        event.locals.pb.authStore.loadFromCookie(event.request.headers.get('cookie') || '');

        try {
            // Refresh auth if needed
            if (event.locals.pb.authStore.isValid) {
                await event.locals.pb.collection('users').authRefresh();
            }
        } catch (_) {
            // Clear auth data on failed refresh
            event.locals.pb.authStore.clear();
        }

        const response = await resolve(event);

        // Set auth cookie in response
        response.headers.set('set-cookie', event.locals.pb.authStore.exportToCookie());

        return response;
    } catch (err) {
        console.error('Hook error:', err);
        return await resolve(event);
    }
}; 