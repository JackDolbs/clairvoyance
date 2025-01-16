<script lang="ts">
    import { fade } from 'svelte/transition';
</script>

<div class="flex items-center justify-center h-screen">
    <h1 
        class="font-orbitron text-4xl font-bold tracking-wider text-center"
        in:fade={{ duration: 300 }}
    >
        Welcome to Clairvoyance!
    </h1>
</div> 