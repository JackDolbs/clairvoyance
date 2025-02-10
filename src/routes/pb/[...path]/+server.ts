import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

async function handleRequest(event: any) {
    const { params, request, url } = event;
    try {
        const pbUrl = `http://localhost:8090/${params.path}${url.search}`;
        console.log('Proxy Request:', {
            url: pbUrl,
            method: request.method,
            headers: Object.fromEntries(request.headers),
            hasBody: request.body ? 'yes' : 'no'
        });

        const headers = new Headers(request.headers);
        headers.delete('host');

        let body;
        if (request.method !== 'GET' && request.body) {
            body = await request.text(); // Get body as text for logging
            console.log('Request Body:', body);
        }

        const response = await fetch(pbUrl, {
            method: request.method,
            headers: headers,
            body: body
        });

        console.log('Proxy Response:', {
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers)
        });

        const newHeaders = new Headers(response.headers);
        newHeaders.set('Access-Control-Allow-Origin', '*');
        newHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        newHeaders.set('Access-Control-Allow-Headers', '*');

        return new Response(response.body, {
            status: response.status,
            headers: newHeaders
        });
    } catch (e) {
        console.error('Detailed Proxy Error:', e);
        throw error(502, 'PocketBase unavailable');
    }
}

export const GET = handleRequest;
export const POST = handleRequest;
export const PUT = handleRequest;
export const DELETE = handleRequest;
export const OPTIONS = handleRequest; 