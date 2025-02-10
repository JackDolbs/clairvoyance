import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// Handle all PocketBase requests
export const GET: RequestHandler = async ({ params, request, url }) => {
    try {
        // Forward request to PocketBase
        const pbUrl = `http://localhost:8090/${params.path}${url.search}`;
        const response = await fetch(pbUrl, {
            method: request.method,
            headers: request.headers,
            body: request.method !== 'GET' ? request.body : undefined
        });

        // Forward response
        return new Response(response.body, {
            status: response.status,
            headers: response.headers
        });
    } catch (e) {
        console.error('PocketBase proxy error:', e);
        throw error(502, 'PocketBase unavailable');
    }
};

export const POST: RequestHandler = GET;
export const PUT: RequestHandler = GET;
export const DELETE: RequestHandler = GET; 