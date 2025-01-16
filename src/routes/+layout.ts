import { browser } from '$app/environment';
import { redirect } from '@sveltejs/kit';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ url }) => {
    if (browser) {
        const authExpiry = localStorage.getItem('authExpiry');
        const isAuthenticated = authExpiry && new Date().getTime() < parseInt(authExpiry);
        
        // If not authenticated and not already on protected page, redirect
        if (!isAuthenticated && url.pathname !== '/protected') {
            throw redirect(302, '/protected');
        }
        
        // If authenticated and on protected page, redirect to main
        if (isAuthenticated && url.pathname === '/protected') {
            throw redirect(302, '/');
        }
    }

    return {};
}; 