<script lang="ts">
	import "../app.css";
</script>

<!-- Desktop View -->
<div class="hidden lg:block">
	<slot />
</div>

<!-- Mobile/Tablet Warning Message -->
<div class="lg:hidden flex flex-col items-center justify-center min-h-screen bg-neutral-50 p-3 text-center">
	<h2 class="font-orbitron text-2xl font-semibold text-neutral-800 mb-10 tracking-wider">
		Sorry 😢
	</h2>
	<p class="font-orbitron text-neutral-600 max-w-lg tracking-wide">
		This app is currently optimized for desktop only. Please access from a larger device.
		Check the <a href="https://roadmap.com" class="text-neutral-900 hover:text-neutral-700 hover:underline underline-offset-2 transition-colors">roadmap</a> for our mobile support timeline.
	</p>
</div>

<svelte:head>
	<meta name="theme-color" content="#171717">
	<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
</svelte:head>