import { browser } from '$app/environment';
import { redirect } from '@sveltejs/kit';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ url }) => {
    if (browser) {
        const authExpiry = localStorage.getItem('authExpiry');
        const isAuthenticated = authExpiry && new Date().getTime() < parseInt(authExpiry);
        const isAuthRoute = url.pathname.startsWith('/auth');
        
        // List of routes we want to work on
        const allowedAuthRoutes = [
            '/auth/login',
            '/auth/register',
            '/auth/forgot-password'
        ];
        
        // If not authenticated and trying to access app routes
        if (!isAuthenticated && !isAuthRoute) {
            throw redirect(302, '/auth/protected');
        }
        
        // If authenticated and trying to access auth routes
        // Only redirect if it's not one of our allowed routes
        if (isAuthenticated && isAuthRoute && !allowedAuthRoutes.includes(url.pathname)) {
            throw redirect(302, '/');
        }
    }

    return {};
}; 