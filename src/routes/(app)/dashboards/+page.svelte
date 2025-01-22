<script lang="ts">
    import { browser } from '$app/environment';
    import PageContent from "$lib/components/page-content.svelte";
    import * as Card from "$lib/components/ui/card";
    import * as ScrollArea from "$lib/components/ui/scroll-area";
    import { Button } from "$lib/components/ui/button";
    import { Plus, Settings, MoreVertical, ChevronLeft, Trash2, Pencil, Share2, Copy, Check } from "lucide-svelte";
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
    import * as AlertDialog from "$lib/components/ui/alert-dialog";
    import { writable } from 'svelte/store';
    import { Input } from "$lib/components/ui/input";
    import { Label } from "$lib/components/ui/label";
    import * as Tooltip from "$lib/components/ui/tooltip";
    import * as Select from "$lib/components/ui/select";
    import { AlertCircle } from "lucide-svelte";
    import { Switch } from "$lib/components/ui/switch";
    import { Trash } from "lucide-svelte";
    import * as ContextMenu from "$lib/components/ui/context-menu";
    import { BarChart3, LineChart, PieChart, Table, Database, ArrowUpRight } from "lucide-svelte";

    // Update the dashboard type to include color
    interface Dashboard {
        id: string;
        name: string;
        isActive: boolean;
        color: string;
    }

    // Initialize store with colors
    const dashboardStore = writable<Dashboard[]>([
        { id: '1', name: 'Overview', isActive: true, color: 'bg-blue-500' },
        { id: '2', name: 'User Analytics', isActive: false, color: 'bg-green-500' },
        { id: '3', name: 'Revenue Metrics', isActive: false, color: 'bg-amber-500' },
        { id: '4', name: 'Customer Insights', isActive: false, color: 'bg-purple-500' },
        { id: '5', name: 'Product Usage', isActive: false, color: 'bg-pink-500' },
        { id: '6', name: 'Marketing Performance', isActive: false, color: 'bg-indigo-500' },
        { id: '7', name: 'Sales Pipeline', isActive: false, color: 'bg-red-500' },
        { id: '8', name: 'Support Metrics', isActive: false, color: 'bg-teal-500' },
        { id: '9', name: 'Team Performance', isActive: false, color: 'bg-blue-500' },
        { id: '10', name: 'Infrastructure Health', isActive: false, color: 'bg-green-500' },
        { id: '11', name: 'Cost Analysis', isActive: false, color: 'bg-amber-500' },
        { id: '12', name: 'Growth Metrics', isActive: false, color: 'bg-purple-500' },
        { id: '13', name: 'Conversion Funnel', isActive: false, color: 'bg-pink-500' },
        { id: '14', name: 'Retention Analysis', isActive: false, color: 'bg-indigo-500' },
        { id: '15', name: 'Feature Adoption', isActive: false, color: 'bg-teal-500' },
        { id: '16', name: 'Security Overview', isActive: false, color: 'bg-blue-500' },
        { id: '17', name: 'API Performance', isActive: false, color: 'bg-green-500' },
        { id: '18', name: 'Database Metrics', isActive: false, color: 'bg-amber-500' },
        { id: '19', name: 'Error Tracking', isActive: false, color: 'bg-purple-500' },
        { id: '20', name: 'User Feedback', isActive: false, color: 'bg-pink-500' }
    ]);

    let dashboards: typeof $dashboardStore;
    let selectedDashboard: typeof $dashboardStore[0];
    
    dashboardStore.subscribe(value => {
        dashboards = value;
        selectedDashboard = selectedDashboard 
            ? value.find(d => d.id === selectedDashboard.id) || value[0] 
            : value[0];
    });

    let isCollapsed = false;
    let sidebarWidth = isCollapsed ? 50 : 260; // Slightly wider default

    // Add color mapping for dashboards
    const colors = [
        'bg-blue-500',
        'bg-green-500',
        'bg-amber-500',
        'bg-purple-500',
        'bg-pink-500',
        'bg-indigo-500',
        'bg-red-500',
        'bg-teal-500'
    ];

    function getDotColor(index: number) {
        const dashboard = dashboards[index];
        return dashboard?.color || colors[index % colors.length];
    }

    function selectDashboard(dashboard: typeof dashboards[0]) {
        dashboards = dashboards.map(d => ({
            ...d,
            isActive: d.id === dashboard.id
        }));
        selectedDashboard = dashboard;
    }

    function toggleSidebar() {
        isCollapsed = !isCollapsed;
        sidebarWidth = isCollapsed ? 64 : 280;
    }

    async function handleDeleteDashboard(id: string) {
        dashboards = dashboards.filter(d => d.id !== id);
        if (selectedDashboard?.id === id) {
            selectedDashboard = dashboards[0];
        }
    }

    let showSettingsDialog = false;
    let showShareDialog = false;

    async function handleDuplicateDashboard(dashboard: typeof dashboards[0]) {
        const newDashboard = {
            ...dashboard,
            id: crypto.randomUUID(),
            name: `${dashboard.name} (Copy)`,
            isActive: false
        };
        dashboards = [...dashboards, newDashboard];
    }

    let editingDashboard: string | null = null;
    let editName = '';

    function startEditing(dashboard: typeof dashboards[0], e: MouseEvent) {
        e.stopPropagation();
        editingDashboard = dashboard.id;
        editName = dashboard.name;
    }

    function handleNameSubmit(dashboard: typeof dashboards[0], e: Event) {
        e.preventDefault();
        if (editName.trim()) {
            dashboards = dashboards.map(d => d.id === dashboard.id ? { ...d, name: editName.trim() } : d);
        }
        editingDashboard = null;
    }

    function handleKeyDown(e: KeyboardEvent) {
        if (e.key === 'Escape') {
            editingDashboard = null;
        }
    }

    // Add state for settings form
    let settingsForm = {
        name: '',
        color: '',
        location: '',
        timezone: '',
        allowedIPs: ''
    };

    // Add to imports
    const locations = [
        'London, UK',
        'New York, USA',
        'Tokyo, Japan',
        'Sydney, Australia',
        'Paris, France',
        'Berlin, Germany',
        'Singapore',
        'Dubai, UAE',
        'Toronto, Canada',
        'Other'
    ];

    // Update settings form initialization
    function openSettings() {
        showSettingsDialog = true;
        settingsForm = {
            name: selectedDashboard.name,  // Pre-fill current name
            color: selectedDashboard.color, // Pre-fill current color
            location: 'London, UK',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            allowedIPs: ''
        };
    }

    function handleSettingsSave() {
        dashboardStore.update(boards => 
            boards.map(d => {
                if (d.id === selectedDashboard.id) {
                    return {
                        ...d,
                        name: settingsForm.name,
                        color: settingsForm.color
                    };
                }
                return d;
            })
        );
        showSettingsDialog = false;
    }

    // Add state for share link
    let shareLink = '';
    let linkCopied = false;

    // Add state for link status
    let isLinkActive = true;
    let hasExistingLink = false;

    // Update generateShareLink to also close and reopen the dialog
    function generateShareLink() {
        shareLink = `https://app.clairvoyance.io/share/${selectedDashboard.id}/${crypto.randomUUID()}`;
        hasExistingLink = true;
        isLinkActive = true;
    }

    // Update deleteShareLink to close the dialog
    function deleteShareLink() {
        shareLink = '';
        hasExistingLink = false;
        isLinkActive = false;
        showShareDialog = false; // Close dialog after deletion
    }

    // Function to copy link
    async function copyShareLink() {
        await navigator.clipboard.writeText(shareLink);
        linkCopied = true;
        setTimeout(() => linkCopied = false, 2000);
    }

    // Add widget options data
    const widgetOptions = {
        charts: [
            { name: 'Bar Chart', icon: BarChart3, description: 'Compare values across categories' },
            { name: 'Line Chart', icon: LineChart, description: 'Show trends over time' },
            { name: 'Pie Chart', icon: PieChart, description: 'Display part-to-whole relationships' }
        ],
        tables: [
            { name: 'Data Table', icon: Table, description: 'Display and analyze raw data' },
            { name: 'Metrics Table', icon: ArrowUpRight, description: 'Show key metrics and changes' }
        ],
        dataSources: [
            { name: 'Database Query', icon: Database, description: 'Create custom SQL queries' }
        ]
    };

    // Add function to handle widget selection
    function handleAddWidget(type: string, name: string) {
        console.log(`Adding ${name} widget of type ${type}`);
        // TODO: Implement widget creation logic
    }
</script>

<style lang="postcss">
    .sidebar-container {
        border-right: 1px solid hsl(var(--border) / 0.3);
        background-color: hsl(var(--background));
        transition: width 200ms ease;
    }

    .toggle-button {
        position: absolute;
        right: -12px;
        top: 50%;
        transform: translateY(-50%);
        width: 24px;
        height: 24px;
        border-radius: 12px;
        background-color: hsl(var(--background));
        border: 1px solid hsl(var(--border));
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: background-color 200ms ease;
        z-index: 10;
    }

    .toggle-button:hover {
        background-color: hsl(var(--muted));
    }
</style>

<PageContent>
    <!-- Update the header section -->
    <div class="flex items-center justify-between mb-6">
        <h1 class="font-orbitron text-2xl font-semibold tracking-wide">
            Dashboards
        </h1>
        <Button 
            variant="outline" 
            class="gap-2"
            onclick={() => {
                // Add dashboard logic
            }}
        >
            <Plus class="w-4 h-4" />
            New Dashboard
        </Button>
    </div>

    <div class="flex h-[calc(100vh-10rem)] gap-6">
        <!-- Sidebar -->
        <div 
            class="sidebar-container relative flex flex-col"
            style:width="{sidebarWidth}px"
        >
            <!-- Dashboard List with ScrollArea -->
            <ScrollArea.Root class="flex-1">
                <div class="px-0 pt-2">
                    <div class="space-y-1 pr-5">
                        {#each dashboards as dashboard, index}
                            <div
                                class={`group w-full flex items-center rounded-md text-sm transition-colors hover:bg-muted/80 ${
                                    isCollapsed ? 'justify-center h-6 w-6' : 'gap-3 px-3 py-2'
                                }`}
                                class:bg-muted={dashboard.isActive}
                                role="button"
                                tabindex="0"
                                onclick={() => selectDashboard(dashboard)}
                                onkeydown={(e) => e.key === 'Enter' && selectDashboard(dashboard)}
                            >
                                <div class={`w-2 h-2 rounded-full flex-none ${dashboard.color || getDotColor(index)}`}></div>
                                {#if !isCollapsed}
                                    {#if editingDashboard === dashboard.id}
                                        <div class="flex-1">
                                            <input
                                                type="text"
                                                bind:value={editName}
                                                class="w-full bg-transparent border-none p-0 focus:ring-0 text-sm"
                                                placeholder="Dashboard name"
                                                onblur={(e) => handleNameSubmit(dashboard, e)}
                                                onkeydown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        handleNameSubmit(dashboard, e);
                                                    }
                                                    if (e.key === 'Escape') {
                                                        editingDashboard = null;
                                                    }
                                                }}
                                            />
                                        </div>
                                    {:else}
                                        <span class="truncate text-left flex-1">
                                            {dashboard.name}
                                        </span>
                                        <div
                                            class="opacity-0 group-hover:opacity-100 transition-opacity"
                                            role="button"
                                            tabindex="0"
                                            onclick={(e) => startEditing(dashboard, e)}
                                            onkeydown={(e) => e.key === 'Enter' && startEditing(dashboard, e)}
                                        >
                                            <div class="p-1 hover:bg-muted rounded-md">
                                                <Pencil class="w-4 h-4 text-muted-foreground" />
                                            </div>
                                        </div>
                                    {/if}
                                {/if}
                            </div>
                        {/each}
                    </div>
                </div>
            </ScrollArea.Root>

            <!-- Toggle Button -->
            <button
                class="toggle-button"
                onclick={toggleSidebar}
                aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
                <ChevronLeft 
                    class={`w-4 h-4 transition-transform duration-200 ${isCollapsed ? 'rotate-180' : ''}`}
                />
            </button>
        </div>

        <!-- Main Content -->
        <div class="flex-1 rounded-lg border bg-card shadow-sm">
            {#if selectedDashboard}
                <div class="p-6">
                    <div class="flex items-center justify-between mb-6">
                        <h1 class="text-xl font-semibold text-left">
                            {selectedDashboard.name}
                        </h1>
                        <div class="flex items-center gap-2">
                            <Button onclick={() => {
                                // Add widget logic
                            }}>
                                <Plus class="w-4 h-4 mr-2" />
                                Add Widget
                            </Button>

                            <DropdownMenu.Root>
                                <DropdownMenu.Trigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <Settings class="w-4 h-4" />
                                        <span class="sr-only">Dashboard settings</span>
                                    </Button>
                                </DropdownMenu.Trigger>
                                <DropdownMenu.Content align="end">
                                    <DropdownMenu.Item onclick={() => showSettingsDialog = true}>
                                        <Settings class="w-4 h-4 mr-2" />
                                        Dashboard Settings
                                    </DropdownMenu.Item>
                                    <DropdownMenu.Item onclick={() => handleDuplicateDashboard(selectedDashboard)}>
                                        <Copy class="w-4 h-4 mr-2" />
                                        Duplicate Dashboard
                                    </DropdownMenu.Item>
                                    <DropdownMenu.Item onclick={() => showShareDialog = true}>
                                        <Share2 class="w-4 h-4 mr-2" />
                                        Share Dashboard
                                    </DropdownMenu.Item>
                                    <DropdownMenu.Separator />
                                    <DropdownMenu.Item 
                                        class="text-destructive focus:text-destructive"
                                        onclick={() => handleDeleteDashboard(selectedDashboard.id)}
                                    >
                                        <Trash2 class="w-4 h-4 mr-2" />
                                        Delete Dashboard
                                    </DropdownMenu.Item>
                                </DropdownMenu.Content>
                            </DropdownMenu.Root>
                        </div>
                    </div>

                    <!-- Dashboard Grid -->
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <!-- Empty state -->
                        <ContextMenu.Root>
                            <ContextMenu.Trigger asChild>
                                <Card.Root class="col-span-full h-[300px] flex items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors">
                                    <div class="text-center space-y-1">
                                        <p class="text-muted-foreground">
                                            This dashboard is empty.
                                        </p>
                                        <p class="text-sm text-muted-foreground">
                                            Right click to add widgets.
                                        </p>
                                    </div>
                                </Card.Root>
                            </ContextMenu.Trigger>

                            <ContextMenu.Content style="min-width: 200px;">
                                {#each widgetOptions.charts as option}
                                    <ContextMenu.Item>
                                        <div class="flex items-center gap-2">
                                            <svelte:component this={option.icon} class="w-4 h-4" />
                                            {option.name}
                                        </div>
                                    </ContextMenu.Item>
                                {/each}

                                <ContextMenu.Separator />

                                {#each widgetOptions.tables as option}
                                    <ContextMenu.Item>
                                        <div class="flex items-center gap-2">
                                            <svelte:component this={option.icon} class="w-4 h-4" />
                                            {option.name}
                                        </div>
                                    </ContextMenu.Item>
                                {/each}

                                <ContextMenu.Separator />

                                {#each widgetOptions.dataSources as option}
                                    <ContextMenu.Item>
                                        <div class="flex items-center gap-2">
                                            <svelte:component this={option.icon} class="w-4 h-4" />
                                            {option.name}
                                        </div>
                                    </ContextMenu.Item>
                                {/each}
                            </ContextMenu.Content>
                        </ContextMenu.Root>
                    </div>
                </div>
            {/if}
        </div>
    </div>

    <!-- Add the dialogs -->
    <AlertDialog.Root open={showSettingsDialog} onOpenChange={(open) => showSettingsDialog = open}>
        <AlertDialog.Content class="max-w-lg">
            <AlertDialog.Header>
                <AlertDialog.Title>Dashboard Settings</AlertDialog.Title>
                <AlertDialog.Description>
                    Configure your dashboard settings and access controls.
                </AlertDialog.Description>
            </AlertDialog.Header>
            <div class="py-6 space-y-6">
                <!-- Basic Settings -->
                <div class="space-y-4">
                    <div class="space-y-2">
                        <Label>Dashboard Name</Label>
                        <Input 
                            bind:value={settingsForm.name} 
                            placeholder="Enter dashboard name"
                        />
                    </div>

                    <div class="space-y-2">
                        <Label>Dot Color</Label>
                        <Select.Root bind:value={settingsForm.color}>
                            <Select.Trigger class="w-full">
                                <div class="flex items-center gap-2">
                                    <div class={`w-2 h-2 rounded-full ${settingsForm.color}`}></div>
                                    <span>{settingsForm.color.replace('bg-', '').replace('-500', '')}</span>
                                </div>
                            </Select.Trigger>
                            <Select.Content>
                                {#each colors as color}
                                    <Select.Item value={color}>
                                        <div class="flex items-center gap-2">
                                            <div class={`w-2 h-2 rounded-full ${color}`}></div>
                                            <span>{color.replace('bg-', '').replace('-500', '')}</span>
                                        </div>
                                    </Select.Item>
                                {/each}
                            </Select.Content>
                        </Select.Root>
                    </div>
                </div>

                <!-- Location Settings -->
                <div class="space-y-4">
                    <div class="space-y-2">
                        <Label>Location</Label>
                        <Select.Root bind:value={settingsForm.location}>
                            <Select.Trigger class="w-full">
                                <span>{settingsForm.location}</span>
                            </Select.Trigger>
                            <Select.Content>
                                {#each locations as location}
                                    <Select.Item value={location}>
                                        {location}
                                    </Select.Item>
                                {/each}
                            </Select.Content>
                        </Select.Root>
                    </div>

                    <div class="space-y-2">
                        <Label>Timezone</Label>
                        <Select.Root bind:value={settingsForm.timezone}>
                            <Select.Trigger class="w-full">
                                <span>{settingsForm.timezone}</span>
                            </Select.Trigger>
                            <Select.Content>
                                {#each Intl.supportedValuesOf('timeZone') as timezone}
                                    <Select.Item value={timezone}>
                                        {timezone}
                                    </Select.Item>
                                {/each}
                            </Select.Content>
                        </Select.Root>
                    </div>
                </div>

                <!-- Access Controls -->
                <div class="space-y-2">
                    <div class="flex items-center gap-2">
                        <Label>Allowed IP Addresses</Label>
                        <Tooltip.Root>
                            <Tooltip.Trigger>
                                <AlertCircle class="w-4 h-4 text-muted-foreground" />
                            </Tooltip.Trigger>
                            <Tooltip.Content>
                                <p>Limit access to this dashboard's share link to specific IP addresses</p>
                            </Tooltip.Content>
                        </Tooltip.Root>
                    </div>
                    <Input 
                        bind:value={settingsForm.allowedIPs} 
                        placeholder="e.g., 192.168.1.1, 10.0.0.0/24"
                    />
                    <p class="text-xs text-muted-foreground">
                        Separate multiple IPs with commas. CIDR notation supported.
                    </p>
                </div>
            </div>
            <AlertDialog.Footer>
                <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
                <AlertDialog.Action onclick={handleSettingsSave}>Save Changes</AlertDialog.Action>
            </AlertDialog.Footer>
        </AlertDialog.Content>
    </AlertDialog.Root>

    <AlertDialog.Root open={showShareDialog} onOpenChange={(open) => showShareDialog = open}>
        <AlertDialog.Content>
            <AlertDialog.Header>
                <AlertDialog.Title>Share Dashboard</AlertDialog.Title>
                <AlertDialog.Description>
                    Share this dashboard with others via a public link.
                </AlertDialog.Description>
            </AlertDialog.Header>
            {#if !hasExistingLink}
                <div class="py-6 space-y-4">
                    <div class="text-center space-y-2">
                        <div class="p-3 bg-muted inline-block rounded-full mb-2">
                            <Share2 class="w-5 h-5 text-muted-foreground" />
                        </div>
                        <h3 class="font-medium">Share Your Dashboard</h3>
                        <p class="text-sm text-muted-foreground max-w-sm mx-auto">
                            Generate a public link to share this dashboard with others on the web.
                        </p>
                    </div>
                </div>
                <AlertDialog.Footer>
                    <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
                    <AlertDialog.Action 
                        onclick={generateShareLink}
                        class="bg-primary"
                    >
                        Publish to Web
                    </AlertDialog.Action>
                </AlertDialog.Footer>
            {:else}
                <div class="py-6 space-y-4">
                    <div class="space-y-2">
                        <Label>Share Link</Label>
                        <div class="flex gap-2">
                            <Input 
                                value={shareLink} 
                                readonly 
                                class={`flex-1 ${!isLinkActive ? 'opacity-50' : ''}`}
                            />
                            <Button 
                                variant="outline" 
                                size="icon"
                                onclick={copyShareLink}
                                disabled={!isLinkActive}
                            >
                                {#if linkCopied}
                                    <Check class="w-4 h-4 text-green-500" />
                                {:else}
                                    <Copy class="w-4 h-4" />
                                {/if}
                            </Button>
                        </div>
                        <p class="text-xs text-muted-foreground">
                            Anyone with this link can view this dashboard.
                        </p>
                    </div>

                    <div class="space-y-2">
                        <div class="flex items-center justify-between">
                            <div class="space-y-1">
                                <Label>Link Status</Label>
                                <p class="text-sm text-muted-foreground">
                                    Control access to your shared dashboard
                                </p>
                            </div>
                            <div class="flex items-center gap-4">
                                <Switch 
                                    checked={isLinkActive}
                                    onCheckedChange={(checked) => isLinkActive = checked}
                                >
                                    <span class="sr-only">Toggle link status</span>
                                </Switch>
                                <span class={`text-xs px-2 py-1 rounded-full ${
                                    isLinkActive 
                                        ? 'bg-green-500/10 text-green-500' 
                                        : 'bg-yellow-500/10 text-yellow-500'
                                }`}>
                                    {isLinkActive ? 'Active' : 'Disabled'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div class="border-t pt-4">
                        <div class="flex items-center justify-between">
                            <div class="space-y-1">
                                <p class="text-sm font-medium">Delete Share Link</p>
                                <p class="text-sm text-muted-foreground">
                                    Permanently remove this share link
                                </p>
                            </div>
                            <Button 
                                variant="destructive" 
                                size="sm"
                                onclick={deleteShareLink}
                                class="gap-2"
                            >
                                <Trash class="w-4 h-4" />
                                Delete Link
                            </Button>
                        </div>
                    </div>
                </div>
                <AlertDialog.Footer>
                    <AlertDialog.Cancel>Close</AlertDialog.Cancel>
                    <AlertDialog.Action 
                        onclick={generateShareLink}
                        class="bg-primary"
                    >
                        Generate New Link
                    </AlertDialog.Action>
                </AlertDialog.Footer>
            {/if}
        </AlertDialog.Content>
    </AlertDialog.Root>
</PageContent> 