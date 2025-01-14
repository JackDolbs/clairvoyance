<script lang="ts">
    import { browser } from '$app/environment';
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { fade } from 'svelte/transition';

    onMount(() => {
        if (browser) {
            const authExpiry = localStorage.getItem('authExpiry');
            if (!authExpiry || new Date().getTime() > parseInt(authExpiry)) {
                goto('/protected');
            }
        }
    });
</script>

<div class="flex items-center justify-center h-screen">
    <h1 
        class="font-orbitron text-4xl font-bold tracking-wider text-center"
        in:fade={{ duration: 300 }}
    >
        Welcome to the protected area!
    </h1>
</div>
