<script lang="ts">
	import SidebarPage from "$lib/components/sidebar-page.svelte";
	import "../app.css";
	import { page } from '$app/stores';
</script>

{#if $page.url.pathname === '/protected'}
	<slot />
{:else}
	<div class="bg-neutral-50">
		<SidebarPage>
			<slot />
		</SidebarPage>
	</div>
{/if}

<svelte:head>
	<meta name="theme-color" content="#171717">
	<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
</svelte:head>