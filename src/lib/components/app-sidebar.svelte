<script lang="ts">
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import * as Collapsible from "$lib/components/ui/collapsible/index.js";
	import Logo from "$lib/components/Logo.svelte";
	import UserInfo from "$lib/components/UserInfo.svelte";
	import ChevronRight from "lucide-svelte/icons/chevron-right";
	import { 
		LayoutDashboard,
        ChartBar,
		Network,
		Database,
		MessageSquare,
		BrainCircuit,
		Settings,
		MessageCircleWarning,

		Share

	} from 'lucide-svelte';

	const navigationItems = [
		{
			title: "Dashboard",
			icon: LayoutDashboard,
			isActive: false,
			items: [
				{
					title: "Overview",
					url: "/dashboard",
				},
				{
					title: "KPIs",
					url: "/kpis",
				}
			]
		},
        {
			title: "Analytics",
			icon: ChartBar,
			isActive: false,
			items: [
				{
					title: "Notebooks",
					url: "/notebooks",
				},
				{
					title: "Reports",
					url: "/reports",
				}
			]
		},
        {
			title: "Query With Chat",
			url: "/chat",
			icon: MessageSquare,
		},
		{
			title: "Knowledge Graph",
			url: "/graph",
			icon: Network,
		},
        {
			title: "Ontology",
			url: "/ontology",
			icon: BrainCircuit,
		},
		{
			title: "Data Sources",
			url: "/sources",
			icon: Database,
		},
        {
			title: "Settings",
			url: "/settings",
			icon: Settings
		}
	];

	const secondaryItems = [
		{
			title: "Feedback",
			url: "https://linktofeedback.com",
			icon: MessageCircleWarning
		},
	];

	const user = {
		name: "Demo User",
		email: "demo@auriel.ai",
		avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=demo"
	};
</script>

<Sidebar.Root variant="inset" class="font-grotesk bg-neutral-50">
	<Sidebar.Header class="bg-neutral-50 border-b">
		<Sidebar.Menu>
				<Sidebar.MenuButton size="lg">
					{#snippet child({ props })}
						<a href="/" {...props} class="flex items-center gap-2 group mx-1">
							<Logo size="text-sm" wrapper={false} />
						</a>
					{/snippet}
				</Sidebar.MenuButton>
		</Sidebar.Menu>
	</Sidebar.Header>

	<Sidebar.Content class="bg-neutral-50 space-y-1 mt-5">
		<!-- Main Navigation -->
		<Sidebar.Group>
			<Sidebar.Menu>
				{#each navigationItems as item (item.title)}
					<Collapsible.Root open={item.isActive}>
						{#snippet child({ props })}
							<Sidebar.MenuItem {...props}>
								<Sidebar.MenuButton>
									{#snippet child({ props })}
										<a href={item.url} {...props}>
											<svelte:component this={item.icon} class="w-4 h-4" />
											<span>{item.title}</span>
										</a>
									{/snippet}
								</Sidebar.MenuButton>
								{#if item.items?.length}
									<Collapsible.Trigger>
										{#snippet child({ props })}
											<Sidebar.MenuAction
												{...props}
												class="data-[state=open]:rotate-90"
											>
												<ChevronRight />
												<span class="sr-only">Toggle</span>
											</Sidebar.MenuAction>
										{/snippet}
									</Collapsible.Trigger>
									<Collapsible.Content>
										<Sidebar.MenuSub>
											{#each item.items as subItem (subItem.title)}
												<Sidebar.MenuSubItem>
													<Sidebar.MenuSubButton href={subItem.url}>
														<span>{subItem.title}</span>
													</Sidebar.MenuSubButton>
												</Sidebar.MenuSubItem>
											{/each}
										</Sidebar.MenuSub>
									</Collapsible.Content>
								{/if}
							</Sidebar.MenuItem>
						{/snippet}
					</Collapsible.Root>
				{/each}
			</Sidebar.Menu>
		</Sidebar.Group>
	</Sidebar.Content>

	<Sidebar.Footer class="font-grotesk bg-neutral-50">
		<!-- Secondary Navigation -->
		<Sidebar.Group>
			<Sidebar.Menu>
				{#each secondaryItems as item (item.title)}
					<Sidebar.MenuItem>
						<Sidebar.MenuButton size="sm">
							{#snippet child({ props })}
								<a href={item.url} {...props}>
									<svelte:component this={item.icon} class="w-4 h-4" />
									<span>{item.title}</span>
								</a>
							{/snippet}
						</Sidebar.MenuButton>
					</Sidebar.MenuItem>
				{/each}
			</Sidebar.Menu>
		</Sidebar.Group>

		<!-- User Menu -->
		<UserInfo {user} />
	</Sidebar.Footer>
</Sidebar.Root>
