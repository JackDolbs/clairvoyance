<script lang="ts">
	import { cn } from "$lib/utils.js";
	import type { WithElementRef } from "bits-ui";
	import type { HTMLAttributes } from "svelte/elements";

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLLIElement>, HTMLLIElement> = $props();
</script>

<h4
	bind:this={ref}
	data-sidebar="menu-item"
	class={cn("group/menu-item relative tracking-wider hover:bg-accent transition-colors rounded-lg", className)}
	{...restProps}
>
	{@render children?.()}
</h4>
