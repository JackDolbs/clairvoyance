<script lang="ts">
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import * as Collapsible from "$lib/components/ui/collapsible/index.js";
	import * as Card from "$lib/components/ui/card";
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
		Share,
		X
	} from 'lucide-svelte';
	import NotificationCards from "$lib/components/notification-cards.svelte";

	let dashboardActive = $state(false);
	let analyticsActive = $state(false);

	const navigationItems = [
		{
			title: "Dashboards",
			icon: LayoutDashboard,
			url: "/dashboards",
		},
        {
			title: "Analytics",
			icon: ChartBar,
			url: "/analytics",
		},
        {
			title: "Chat Insights",
			url: "/chat",
			icon: MessageSquare,
		},
		{
			title: "Knowledge Graph",
			url: "/knowledge-graph",
			icon: Network,
		},
        {
			title: "Your Ontology",
			url: "/ontology",
			icon: BrainCircuit,
		},
		{
			title: "Data Sources",
			url: "/data-sources",
			icon: Database,
		},
        {
			title: "Config",
			url: "/config",
			icon: Settings
		}
	];

	const secondaryItems = [
		{
			title: "Share Feedback",
			description: "Help us improve Clairvoyance by sharing your thoughts.",
			url: "https://linktofeedback.com",
		},
		{
			title: "New Features Available",
			description: "Stay up-to-date with the latest improvements by checking out the changelog.",
			url: "https://linktofeedback.com",
		},
		{
			title: "Work With Us",
			description: "Apply to work with Auriel Analytics for custom Clairvoyance instances.",
			url: "https://auriel.tech/enquire",
		}
	];

	const user = {
		name: "Demo User",
		email: "demo@auriel.ai",
		avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=demo"
	};

	function isItemActive(item: typeof navigationItems[number]) {
		if (item.title === "Dashboards") return dashboardActive;
		if (item.title === "Analytics") return analyticsActive;
		return false;
	}
</script>

<Sidebar.Root variant="inset" class="font-grotesk bg-neutral-50">
	<Sidebar.Header class="bg-neutral-50 border-b py-4">
		<Sidebar.Menu>
				<Sidebar.MenuButton size="lg">
					{#snippet child({ props })}
						<a href="/" {...props} class="flex items-center gap-2 group mx-1">
							<Logo size="text-lg"/>
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
					<Collapsible.Root 
						open={isItemActive(item)}
						onOpenChange={(open) => {
							if (item.title === "Dashboard") dashboardActive = open;
							if (item.title === "Analytics") analyticsActive = open;
						}}
					>
						{#snippet child({ props })}
							<Sidebar.MenuItem {...props}>
								<Sidebar.MenuButton>
									{#snippet child({ props })}
										{#if item.items?.length}
											<button 
												{...props} 
												class="flex items-center gap-2 mx-2 py-1.5 text-sm w-full"
												onclick={() => {
													if (item.title === "Dashboards") {
														dashboardActive = !dashboardActive;
													} else if (item.title === "Analytics") {
														analyticsActive = !analyticsActive;
													}
												}}
											>
												<item.icon class="w-4 h-4" />
												<span>{item.title}</span>
											</button>
										{:else}
											<a href={item.url} {...props}>
												<item.icon class="w-4 h-4" />
												<span>{item.title}</span>
											</a>
										{/if}
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

		<Sidebar.Group>
			<NotificationCards items={secondaryItems} />
		</Sidebar.Group>


		<UserInfo {user} />

        <!-- Footer -->
         <div>
            <p class="text-center text-[8px] text-neutral-400">
              &copy; {new Date().getFullYear()} <a class="hover:underline" href="https://auriel.tech/" target="_blank" rel="noopener noreferrer">Auriel Analytics Ltd.</a> · v{__APP_VERSION__} ({__COMMIT_HASH__})
            </p>
         </div>
	</Sidebar.Footer>
</Sidebar.Root>
