import { writable } from 'svelte/store';
import { browser } from '$app/environment';

function createProfileStore(key: string, defaultValue: string) {
    const store = writable(browser ? localStorage.getItem(key) || defaultValue : defaultValue);
    
    if (browser) {
        store.subscribe(value => {
            localStorage.setItem(key, value);
        });
    }
    
    return store;
}

export const firstName = writable<string>('');
export const lastName = writable<string>('');
export const orgName = createProfileStore('user_orgName', 'Demo Company');

// Helper to get full name
export function getFullName(first: string, last: string): string {
    if (!first && !last) return 'Demo User';
    if (!last) return first;
    return `${first} ${last}`;
}

// Helper to get initials
export function getInitials(first: string, last: string): string {
    if (!first && !last) return 'DU';
    if (!last) return first.slice(0, 2).toUpperCase();
    return (first[0] + last[0]).toUpperCase();
} 