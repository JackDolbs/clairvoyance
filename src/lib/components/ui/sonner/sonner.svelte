<script lang="ts">
	import { Toaster as SonnerToaster } from "svelte-sonner";
	import { cn } from "$lib/utils";
	import { mode } from "mode-watcher";

	let className: string | undefined | null = undefined;
	export { className as class };
	export let richColors = false;
</script>

<SonnerToaster
	theme={$mode}
	{richColors}
	class={cn(
		"toaster group",
		className
	)}
	toastOptions={{
		classes: {
			toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg [&_div[data-title]]:font-orbitron",
			description: "group-[.toast]:text-muted-foreground font-grotesk",
			actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
			cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
		},
	}}
/>
