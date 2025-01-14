<script lang="ts">
    import { browser } from '$app/environment';
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';

    onMount(() => {
        if (browser) {
            const authExpiry = localStorage.getItem('authExpiry');
            if (!authExpiry || new Date().getTime() > parseInt(authExpiry)) {
                goto('/protected');
            }
        }
    });
</script>

<div>
    <!-- Your main page content here -->
</div>
