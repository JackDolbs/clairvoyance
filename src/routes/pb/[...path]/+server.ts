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

        const response = await fetch(pbUrl, {
            method: request.method,
            headers: headers,
            body: request.method !== 'GET' && request.body ? await request.arrayBuffer() : undefined
        });

        // Forward response with CORS headers
        const newHeaders = new Headers(response.headers);
        newHeaders.set('Access-Control-Allow-Origin', '*');
        newHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        newHeaders.set('Access-Control-Allow-Headers', 'Content-Type');

        return new Response(response.body, {
            status: response.status,
            headers: newHeaders
        });
    } catch (e) {
        console.error('PocketBase proxy error:', e);
        throw error(502, 'PocketBase unavailable');
    }
}

export const GET = handleRequest;
export const POST = handleRequest;
export const PUT = handleRequest;
export const DELETE = handleRequest;
export const OPTIONS = handleRequest; 