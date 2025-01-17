<script lang="ts">
	import ForgotPasswordPage from "$lib/components/forgot-password-page.svelte";
	import { fade } from 'svelte/transition';
</script>

<div in:fade={{ duration: 300 }}>
	<ForgotPasswordPage />
</div> 