import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// Handle all PocketBase requests
export const GET: RequestHandler = async ({ params, request }) => {
    try {
        const response = await fetch(`http://localhost:8090/${params.path}`, {
            method: request.method,
            headers: request.headers,
            body: request.body
        });
        return new Response(response.body, {
            status: response.status,
            headers: response.headers
        });
    } catch (e) {
        throw error(502, 'PocketBase unavailable');
    }
};

export const POST: RequestHandler = GET;
export const PUT: RequestHandler = GET;
export const DELETE: RequestHandler = GET; 