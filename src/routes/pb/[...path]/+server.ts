import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, locals, request }) => {
    try {
        // Log full request details
        console.log('PocketBase Proxy Request:', {
            url: request.url,
            method: request.method,
            path: params.path,
            headers: Object.fromEntries(request.headers.entries())
        });

        // Log PocketBase instance details
        console.log('PocketBase Instance:', {
            url: locals.pb.baseUrl,
            authStore: locals.pb.authStore.isValid
        });

        const response = await locals.pb.send(request.url, {
            method: request.method,
            headers: request.headers,
            body: request.body
        });

        console.log('PocketBase Response:', {
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries())
        });

        return new Response(response.body, {
            status: response.status,
            headers: response.headers
        });
    } catch (err) {
        // Enhanced error logging
        console.error('PocketBase Proxy Error:', {
            error: err instanceof Error ? err.message : String(err),
            stack: err instanceof Error ? err.stack : undefined,
            url: request.url,
            method: request.method,
            path: params.path
        });

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