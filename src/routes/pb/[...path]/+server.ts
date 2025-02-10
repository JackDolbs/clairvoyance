import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

async function handleRequest(event: any) {
    const { params, request, url } = event;
    try {
        // Forward request to PocketBase
        const pbUrl = `http://localhost:8090/${params.path}${url.search}`;
        
        // Create new headers without host
        const headers = new Headers(request.headers);
        headers.delete('host');
        headers.set('Content-Type', 'application/json');

        // Get request body if it exists
        let body = null;
        if (request.method !== 'GET') {
            body = await request.text();
        }

        console.log('Proxy Request:', {
            url: pbUrl,
            method: request.method,
            body
        });

        const response = await fetch(pbUrl, {
            method: request.method,
            headers,
            body
        });

        return new Response(response.body, {
            status: response.status,
            headers: response.headers
        });
    } catch (e) {
        console.error('PocketBase proxy error:', e);
        throw error(502, 'PocketBase unavailable');
    }
}

// Handle all methods
export const GET = handleRequest;
export const POST = handleRequest;
export const PUT = handleRequest;
export const PATCH = handleRequest;
export const DELETE = handleRequest;
export const OPTIONS = handleRequest; 