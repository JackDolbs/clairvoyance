<script lang="ts">
	import { Toaster as SonnerToaster } from "sonner";
	import { cn } from "$lib/utils";
	import { mode } from "mode-watcher";

	let className: string | undefined | null = undefined;
	export { className as class };
</script>

<SonnerToaster
	theme={$mode}
	class={cn(
		"toaster group",
		className
	)}
	toastOptions={{
		classes: {
			toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
			description: "group-[.toast]:text-muted-foreground",
			actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
			cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
		},
	}}
/>
