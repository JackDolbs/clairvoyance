<script lang="ts">
    import { browser } from '$app/environment';
    import PageContent from "$lib/components/page-content.svelte";
    import * as Card from "$lib/components/ui/card";
    import * as ScrollArea from "$lib/components/ui/scroll-area";
    import { Button } from "$lib/components/ui/button";
    import { Plus, Settings, MoreVertical, ChevronLeft, Trash2, Pencil } from "lucide-svelte";
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu";

    let dashboards = [
        { id: '1', name: 'Overview', isActive: true },
        { id: '2', name: 'User Analytics', isActive: false },
        { id: '3', name: 'Revenue Metrics', isActive: false },
        { id: '4', name: 'Customer Insights', isActive: false },
        { id: '5', name: 'Product Usage', isActive: false },
        { id: '6', name: 'Marketing Performance', isActive: false },
        { id: '7', name: 'Sales Pipeline', isActive: false },
        { id: '8', name: 'Support Metrics', isActive: false },
        { id: '9', name: 'Team Performance', isActive: false },
        { id: '10', name: 'Infrastructure Health', isActive: false },
        { id: '11', name: 'Cost Analysis', isActive: false },
        { id: '12', name: 'Growth Metrics', isActive: false },
        { id: '13', name: 'Conversion Funnel', isActive: false },
        { id: '14', name: 'Retention Analysis', isActive: false },
        { id: '15', name: 'Feature Adoption', isActive: false },
        { id: '16', name: 'Security Overview', isActive: false },
        { id: '17', name: 'API Performance', isActive: false },
        { id: '18', name: 'Database Metrics', isActive: false },
        { id: '19', name: 'Error Tracking', isActive: false },
        { id: '20', name: 'User Feedback', isActive: false }
    ];

    let selectedDashboard = dashboards[0];
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
        return colors[index % colors.length];
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
                            <button
                                class={`group w-full flex items-center rounded-md text-sm transition-colors hover:bg-muted/80 ${
                                    isCollapsed ? 'justify-center h-6 w-6' : 'gap-3 px-3 py-2'
                                }`}
                                class:bg-muted={dashboard.isActive}
                                onclick={() => selectDashboard(dashboard)}
                            >
                                <div class={`w-2 h-2 rounded-full flex-none ${getDotColor(index)}`} />
                                {#if !isCollapsed}
                                    <span class="truncate text-left flex-1">
                                        {dashboard.name}
                                    </span>
                                    <div class="opacity-0 group-hover:opacity-100 transition-opacity">
                                        <DropdownMenu.Root>
                                            <DropdownMenu.Trigger asChild>
                                                <button
                                                    class="p-1 hover:bg-muted rounded-md"
                                                    onclick={(e) => e.stopPropagation()}
                                                >
                                                    <MoreVertical class="w-4 h-4 text-muted-foreground" />
                                                </button>
                                            </DropdownMenu.Trigger>
                                            <DropdownMenu.Content align="end">
                                                <DropdownMenu.Item 
                                                    onclick={(e) => {
                                                        e.stopPropagation();
                                                        // Add edit logic
                                                    }}
                                                >
                                                    <Pencil class="w-4 h-4 mr-2" />
                                                    Edit Name
                                                </DropdownMenu.Item>
                                                <DropdownMenu.Separator />
                                                <DropdownMenu.Item 
                                                    class="text-destructive focus:text-destructive"
                                                    onclick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteDashboard(dashboard.id);
                                                    }}
                                                >
                                                    <Trash2 class="w-4 h-4 mr-2" />
                                                    Delete
                                                </DropdownMenu.Item>
                                            </DropdownMenu.Content>
                                        </DropdownMenu.Root>
                                    </div>
                                {/if}
                            </button>
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
        <div class="flex-1 rounded-lg border-2 bg-card shadow-sm">
            {#if selectedDashboard}
                <div class="p-6">
                    <div class="flex items-center justify-between mb-6">
                        <h1 class="text-xl font-semibold text-left">
                            {selectedDashboard.name}
                        </h1>
                        <Button onclick={() => {
                            // Add widget logic
                        }}>
                            <Plus class="w-4 h-4 mr-2" />
                            Add Widget
                        </Button>
                    </div>

                    <!-- Dashboard Grid -->
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <!-- Empty state -->
                        <Card.Root class="col-span-full h-[300px] flex items-center justify-center">
                            <div class="text-center space-y-1">
                                <p class="text-muted-foreground">
                                    This dashboard is empty.
                                </p>
                                <p class="text-muted-foreground">
                                    Add widgets to get started.
                                </p>
                            </div>
                        </Card.Root>
                    </div>
                </div>
            {/if}
        </div>
    </div>
</PageContent> 