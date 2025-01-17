<script lang="ts">
    import LoginPage from "$lib/components/login-page.svelte";
    import { fade } from 'svelte/transition';
</script>

<div in:fade={{ duration: 300 }}>
    <LoginPage />
</div> 