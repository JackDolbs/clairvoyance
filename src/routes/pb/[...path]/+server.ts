import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, locals, request }) => {
    try {
        // Log the request for debugging
        console.log('Proxying request to PocketBase:', request.url);
        
        const response = await locals.pb.send(request.url, {
            method: request.method,
            headers: request.headers,
            body: request.body
        });

        // Log the response status for debugging
        console.log('PocketBase response status:', response.status);

        return new Response(response.body, {
            status: response.status,
            headers: response.headers
        });
    } catch (err) {
        console.error('PocketBase proxy error:', err);
        throw error(500, {
            message: 'PocketBase request failed',
            error: err instanceof Error ? err.message : String(err)
        });
    }
};

export const POST: RequestHandler = GET;
export const PATCH: RequestHandler = GET;
export const PUT: RequestHandler = GET;
export const DELETE: RequestHandler = GET;
export const OPTIONS: RequestHandler = GET; 