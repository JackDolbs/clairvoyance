<script lang="ts">
	import RegisterPage from "$lib/components/register-page.svelte";
	import { fade } from 'svelte/transition';
</script>

<div in:fade={{ duration: 300 }}>
	<RegisterPage />
</div> 