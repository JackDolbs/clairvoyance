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

export const displayName = createProfileStore('user_displayName', 'Demo User');
export const orgName = createProfileStore('user_orgName', 'Demo Company'); 