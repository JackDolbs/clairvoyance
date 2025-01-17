import { browser } from '$app/environment';
import { redirect } from '@sveltejs/kit';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ url }) => {
    if (browser) {
        const authExpiry = localStorage.getItem('authExpiry');
        const isAuthenticated = authExpiry && new Date().getTime() < parseInt(authExpiry);
        const isAuthRoute = url.pathname.startsWith('/auth');

        if (!isAuthenticated && !isAuthRoute) {
            throw redirect(302, '/auth/protected');
        }

        if (isAuthenticated && isAuthRoute) {
            throw redirect(302, '/');
        }
    }

    return {};
}; 