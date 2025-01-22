<script lang="ts">
	import { ChevronsUpDown, LogOut, Settings, HelpCircle, HeartHandshake, GitFork } from "lucide-svelte";
	import { goto } from "$app/navigation";
	import { browser } from '$app/environment';
	import { firstName, lastName, orgName, getFullName, getInitials } from '$lib/stores/profile';
	import { toast } from "$lib/components/ui/sonner";
	import { OnboardingModal } from "$lib/components/ui/onboarding";

	import * as Avatar from "$lib/components/ui/avatar/index.js";
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import { useSidebar } from "$lib/components/ui/sidebar/index.js";

	const sidebar = useSidebar();

	let showOnboarding = false;

	// Initialize from localStorage
	if (browser) {
		$firstName = localStorage.getItem('user_firstName') || '';
		$lastName = localStorage.getItem('user_lastName') || '';
		$orgName = localStorage.getItem('user_orgName') || 'Demo Company';
	}

	$: fullName = getFullName($firstName, $lastName);
	$: initials = getInitials($firstName, $lastName);

	function handleProfileClick() {
		goto('/profile');
	}

	function handleRoadmapClick() {
		window.open('https://featurebase.app', '_blank');
	}

	function handleHelpClick() {
		window.open('https://docs.auriel.tech', '_blank');
	}

	function handleOnboardingClick() {
		showOnboarding = true;
	}

	async function handleLogout() {
		// Remove auth expiry from localStorage
		localStorage.removeItem('authExpiry');
		toast.info("Logging out...");
		await new Promise(resolve => setTimeout(resolve, 500));
		toast.success("Logged out successfully");
		// Redirect to login page
		goto('/auth/protected');
	}
</script>

<Sidebar.Menu>
	<Sidebar.MenuItem>
		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
				{#snippet child({ props })}
				<Sidebar.MenuButton
					{...props}
					size="lg"
					class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
				>
					<Avatar.Root class="h-8 w-8 rounded-lg">
						<Avatar.Fallback class="rounded-lg">{initials}</Avatar.Fallback>
					</Avatar.Root>
					<div class="grid flex-1 text-left text-sm leading-tight">
						<span class="truncate font-semibold">{fullName}</span>
						<span class="truncate text-xs text-gray-500">{$orgName}</span>
					</div>
					<ChevronsUpDown class="ml-auto size-4" />
				</Sidebar.MenuButton>
				{/snippet}
			</DropdownMenu.Trigger>
			<DropdownMenu.Content
				class="w-[--bits-dropdown-menu-anchor-width] min-w-56 rounded-lg"
				side={sidebar.isMobile ? "bottom" : "right"}
				align="end"
				sideOffset={4}
			>
				<DropdownMenu.Label class="p-0 font-normal">
					<div class="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
						<Avatar.Root class="h-8 w-8 rounded-lg">
							<Avatar.Fallback class="rounded-lg">{initials}</Avatar.Fallback>
						</Avatar.Root>
						<div class="grid flex-1 text-left text-sm leading-tight">
							<span class="truncate font-semibold">{fullName}</span>
							<span class="truncate text-xs text-gray-500">{$orgName}</span>
						</div>
					</div>
				</DropdownMenu.Label>
				<DropdownMenu.Separator />
				<DropdownMenu.Group>
					<DropdownMenu.Item 
						onSelect={handleProfileClick}
						class="cursor-pointer"
					>
						<Settings class="w-4 h-4" />
						My Profile
					</DropdownMenu.Item>
					<DropdownMenu.Item 
						onSelect={handleOnboardingClick}
						class="cursor-pointer"
					>
						<HeartHandshake class="w-4 h-4" />
						Onboarding
					</DropdownMenu.Item>
					<DropdownMenu.Item 
						onSelect={handleRoadmapClick}
						class="cursor-pointer"
					>
						<GitFork class="w-4 h-4" />
						Roadmap
					</DropdownMenu.Item>
					<DropdownMenu.Item 
						onSelect={handleHelpClick}
						class="cursor-pointer"
					>
						<HelpCircle class="w-4 h-4" />
						Help
					</DropdownMenu.Item>
				</DropdownMenu.Group>
				<DropdownMenu.Separator />
				<DropdownMenu.Item
					onSelect={handleLogout}
					class="text-red-600 cursor-pointer"
				>
					<LogOut class="w-4 h-4 mr-2" />
					<span>Log Out</span>
				</DropdownMenu.Item>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</Sidebar.MenuItem>
</Sidebar.Menu>

<OnboardingModal bind:open={showOnboarding} />
