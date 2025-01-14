<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";
	import type { WithElementRef } from "bits-ui";

	let {
		ref = $bindable(null),
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> = $props();
</script>

<div bind:this={ref} role="separator" class="mx-2" {...restProps}>
	{#if children}
		{@render children?.()}
	{:else}
		-
	{/if}
</div>

<style>
	div {
		color: #666;
	}
</style>
