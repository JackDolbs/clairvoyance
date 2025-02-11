import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, params, request }) => {
    try {
        const pbUrl = process.env.POCKETBASE_URL || 'http://localhost:8090';
        const path = params.path || '';
        console.log('Proxying request to:', `${pbUrl}/${path}`);
        
        // Forward the original request headers
        const headers = new Headers(request.headers);
        headers.set('Content-Type', 'application/json');
        headers.set('Accept', 'application/json');

        const response = await fetch(`${pbUrl}/${path}`, {
            method: request.method,
            headers,
            body: request.method !== 'GET' ? await request.text() : undefined
        });

        if (!response.ok) {
            // Forward the error response from PocketBase
            const errorData = await response.text();
            console.error('PocketBase error response:', errorData);
            return new Response(errorData, {
                status: response.status,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }

        const data = await response.text();
        console.log('PocketBase response:', data.substring(0, 100));

        return new Response(data, {
            status: response.status,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (err) {
        console.error('PocketBase proxy error:', err);
        throw error(500, 'Failed to proxy request to PocketBase');
    }
};

// Create handlers for other methods that properly handle the request body
export const POST: RequestHandler = GET;
export const PATCH: RequestHandler = GET;
export const PUT: RequestHandler = GET;
export const DELETE: RequestHandler = GET;
export const OPTIONS: RequestHandler = GET; 