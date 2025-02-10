import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, locals, request }) => {
    try {
        const response = await locals.pb.send(request.url, {
            method: request.method,
            headers: request.headers,
            body: request.body
        });

        return new Response(response.body, {
            status: response.status,
            headers: response.headers
        });
    } catch (err) {
        console.error('PocketBase proxy error:', err);
        throw error(500, 'PocketBase request failed');
    }
};

export const POST: RequestHandler = GET;
export const PATCH: RequestHandler = GET;
export const PUT: RequestHandler = GET;
export const DELETE: RequestHandler = GET;

export const OPTIONS: RequestHandler = async ({ params, locals, request }) => {
    try {
        const response = await locals.pb.send(request.url, {
            method: request.method,
            headers: request.headers,
            body: request.body
        });

        return new Response(response.body, {
            status: response.status,
            headers: response.headers
        });
    } catch (err) {
        console.error('PocketBase proxy error:', err);
        throw error(500, 'PocketBase request failed');
    }
}; 