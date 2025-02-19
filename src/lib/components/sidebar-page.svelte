<script lang="ts">
	import AppSidebar from "$lib/components/app-sidebar.svelte";
	import * as Breadcrumb from "$lib/components/ui/breadcrumb/index.js";
	import { Separator } from "$lib/components/ui/separator/index.js";
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import { page } from "$app/stores";
	import { ChevronRight } from "lucide-svelte";

	// Get the current route segments
	$: segments = $page.url.pathname
		.split('/')
		.filter(Boolean)
		.map(segment => ({
			label: segment.charAt(0).toUpperCase() + segment.slice(1),
			href: segment === 'conversation' ? '/chat/conversation' : '/' + segment
		}));

	// Add tab to breadcrumb if present
	$: {
		const tab = $page.url.searchParams.get('tab');
		const isConfigPage = segments.length > 0 && segments[segments.length - 1].label === 'Config';
		
		if (isConfigPage) {
			const tabLabels = {
				instance: "Application",
				updates: "Updates",
				chat: "Chat",
				auth: "Authentication",
				backup: "Backup"
			};
			segments = [
				...segments,
				{
					label: tab ? (tabLabels[tab] || tab.charAt(0).toUpperCase() + tab.slice(1)) : "Application",
					href: `${segments[segments.length - 1].href}${tab ? `?tab=${tab}` : ''}`
				}
			];
		}
	}
</script>

<Sidebar.Provider>
	<AppSidebar />
	<Sidebar.Inset>
		<header class="flex h-16 shrink-0 items-center gap-2">
			<div class="flex items-center gap-2 px-4">
				<Sidebar.Trigger class="-ml-1" />
				<Separator orientation="vertical" class="mr-2 h-4" />
				<Breadcrumb.Root>
					<Breadcrumb.List>
						<Breadcrumb.Item class="font-orbitron tracking-wider">
							<Breadcrumb.Link href="/">Home</Breadcrumb.Link>
						</Breadcrumb.Item>
						{#each segments as segment, i}
							<Breadcrumb.Separator />
							<Breadcrumb.Item class="font-orbitron tracking-wider">
								{#if i === segments.length - 1}
									<Breadcrumb.Page>{segment.label}</Breadcrumb.Page>
								{:else}
									<Breadcrumb.Link href={segment.href}>
										{segment.label}
									</Breadcrumb.Link>
								{/if}
							</Breadcrumb.Item>
						{/each}
					</Breadcrumb.List>
				</Breadcrumb.Root>
			</div>
		</header>
		<slot />
	</Sidebar.Inset>
</Sidebar.Provider>
