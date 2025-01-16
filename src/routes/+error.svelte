<script lang="ts">
    import { page } from '$app/stores';
    import { fade } from 'svelte/transition';
</script>

<div 
    class="flex flex-col items-center justify-center min-h-screen bg-neutral-50 space-y-4"
    in:fade={{ duration: 300 }}
>
    <h1 class="font-orbitron text-6xl font-bold text-neutral-800">
        {$page.status}
    </h1>
    
    <p class="font-orbitron text-xl text-neutral-600">
        {$page.error?.message || "Page not found"}
    </p>

    <a 
        href="/"
        class="mt-4 px-6 py-2 bg-neutral-900 text-white font-orbitron 
               rounded-lg hover:bg-neutral-800 transition-colors"
    >
        Go Home
    </a>
</div> 