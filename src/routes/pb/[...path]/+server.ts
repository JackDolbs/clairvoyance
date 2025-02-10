import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, locals, request }) => {
    console.log('=== PocketBase Proxy Request ===');
    try {
        // Log full request details
        console.log('Request details:', {
            url: request.url,
            method: request.method,
            path: params.path,
            headers: Object.fromEntries(request.headers.entries())
        });

        // Log PocketBase instance details
        console.log('PocketBase instance:', {
            url: locals.pb.baseUrl,
            authStore: locals.pb.authStore.isValid,
            token: locals.pb.authStore.token?.substring(0, 20) + '...' // Log partial token for debugging
        });

        console.log('Sending request to PocketBase');
        const response = await locals.pb.send(request.url, {
            method: request.method,
            headers: request.headers,
            body: request.body
        });

        console.log('PocketBase response:', {
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries())
        });

        return new Response(response.body, {
            status: response.status,
            headers: response.headers
        });
    } catch (err) {
        console.error('PocketBase Proxy Error:', {
            error: err instanceof Error ? err.message : String(err),
            stack: err instanceof Error ? err.stack : undefined,
            url: request.url,
            method: request.method,
            path: params.path,
            pbUrl: locals.pb?.baseUrl
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