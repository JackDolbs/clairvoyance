<script lang="ts">
    import PageContent from "$lib/components/page-content.svelte";
    import { firstName } from '$lib/stores/profile';
    import { browser } from '$app/environment';
    import * as Card from "$lib/components/ui/card";
    import { MessageSquare, Database, Brain, FileSpreadsheet, ArrowRight, AlertCircle, Network, BookOpen, Plus, Clock } from "lucide-svelte";
    import { Button } from "$lib/components/ui/button";
    import { goto } from "$app/navigation";
    import * as Tooltip from "$lib/components/ui/tooltip";
    import { onMount, onDestroy } from 'svelte';

    let isFirstVisit = true;

    if (browser) {
        // Check if user has set their name before
        isFirstVisit = !localStorage.getItem('user_firstName');
    }

    // Mock data for now - later this would be user-configured
    const metrics = [
        { 
            label: 'Active Users',
            value: '1,234',
            change: '+12.3%',
            isPositive: true 
        },
        { 
            label: 'Revenue MRR',
            value: '$45.5k',
            change: '+8.1%',
            isPositive: true
        },
        { 
            label: 'Churn Rate',
            value: '0.8%',
            change: '-0.2%',
            isPositive: true
        },
        { 
            label: 'Customer CAC',
            value: '$123',
            change: '+2.4%',
            isPositive: false
        }
    ];

    let currentDate = '';
    let currentTime = '';
    let interval: NodeJS.Timer;

    function updateDateTime() {
        const now = new Date();
        currentDate = now.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        
        // 24-hour time format (HHMM)
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        currentTime = `${hours}:${minutes}`;
    }

    onMount(() => {
        updateDateTime(); // Initial update
        interval = setInterval(updateDateTime, 1000); // Update every second
    });

    onDestroy(() => {
        if (interval) clearInterval(interval);
    });

    // Mock data for connected sources
    const connectedSources = [
        {
            name: 'Mixpanel',
            type: 'Product Analytics',
            logo: 'https://cdn.worldvectorlogo.com/logos/mixpanel.svg',
            status: 'connected',
            lastSync: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
            syncStatus: 'success'
        },
        {
            name: 'PostHog',
            type: 'Web Analytics',
            logo: 'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fassets.stickpng.com%2Fimages%2F62cc4f997755665152a8df88.png&f=1&nofb=1&ipt=2b7108edecdcec3d696fb0e0e5607b696caeb5f5eb9446ba4b33c721aabc0531&ipo=images',
            status: 'connected',
            lastSync: new Date(Date.now() - 45 * 1000), // 45 seconds ago
            syncStatus: 'syncing'
        },
        {
            name: 'Stripe',
            type: 'Payment Processing',
            logo: 'https://cdn.worldvectorlogo.com/logos/stripe-4.svg',
            status: 'connected',
            lastSync: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
            syncStatus: 'success'
        }
    ];

    function getTimeAgo(date: Date) {
        const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
        
        if (seconds < 60) return `${seconds} seconds ago`;
        if (seconds < 3600) return `${Math.floor(seconds/60)} minutes ago`;
        if (seconds < 86400) return `${Math.floor(seconds/3600)} hours ago`;
        return `${Math.floor(seconds/86400)} days ago`;
    }
</script>

<style>
    @keyframes pulse {
        0% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7);
        }
        
        70% {
            transform: scale(1);
            box-shadow: 0 0 0 6px rgba(34, 197, 94, 0);
        }
        
        100% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(34, 197, 94, 0);
        }
    }

    .status-dot {
        animation: pulse 2s infinite;
        background-color: rgb(34 197 94); /* green-500 */
        box-shadow: 0 0 0 0 rgba(34, 197, 94, 1);
    }

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }

    .syncing {
        animation: spin 2s linear infinite;
    }
</style>

<PageContent>
    <div class="flex flex-col items-start gap-4 mb-0 pb-6 border-b">
        <h1 class="font-orbitron text-2xl font-semibold tracking-wide">
            {#if isFirstVisit}
                Welcome to Clairvoyance!
            {:else}
                Welcome back, {$firstName}.
            {/if}
        </h1>
        <div class="flex items-center gap-2 text-xs text-muted-foreground font-orbitron tracking-wider">
            <span>{currentDate}</span>
            <span class="w-1 h-1 rounded-full bg-muted-foreground/50"></span>
            <span>{currentTime}</span>
        </div>
        {#if isFirstVisit}
            <p class="text-muted-foreground">
                Get started by customizing your profile in the bottom left menu.
            </p>
        {/if}
    </div>

    <!-- New metrics section -->
    <div class="space-y-6 mb-10">
        
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 border-b py-10">
            {#each metrics as metric}
                <Card.Root>
                    <Card.Content class="pt-6">
                        <div class="flex justify-between items-start">
                            <div>
                                <p class="text-sm font-medium text-muted-foreground">
                                    {metric.label}
                                </p>
                                <div class="flex items-baseline gap-2">
                                    <p class="text-2xl font-semibold mt-1">
                                        {metric.value}
                                    </p>
                                    <span class={`text-sm font-medium ${metric.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                                        {metric.change}
                                    </span>
                                </div>
                            </div>
                            <Tooltip.Root>
                                <Tooltip.Trigger>
                                    <AlertCircle class="w-4 h-4 text-amber-500" />
                                </Tooltip.Trigger>
                                <Tooltip.Content>
                                    <p>Metric customization coming soon</p>
                                </Tooltip.Content>
                            </Tooltip.Root>
                        </div>
                    </Card.Content>
                </Card.Root>
            {/each}
        </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Quick Actions -->
        <Card.Root>
            <Card.Header>
                <Card.Title>Quick Actions</Card.Title>
            </Card.Header>
            <Card.Content class="space-y-4">
                <Button 
                    variant="outline" 
                    class="w-full justify-between"
                    onclick={() => goto('/ontology')}
                >
                    <div class="flex items-center gap-2">
                        <Network class="w-4 h-4" />
                        Customize Your Ontology
                    </div>
                    <ArrowRight class="w-4 h-4" />
                </Button>
                <Button 
                    variant="outline" 
                    class="w-full justify-between"
                    onclick={() => goto('/data-sources')}
                >
                    <div class="flex items-center gap-2">
                        <Database class="w-4 h-4" />
                        Connect Data Sources
                    </div>
                    <ArrowRight class="w-4 h-4" />
                </Button>
                <Button 
                    variant="outline" 
                    class="w-full justify-between"
                    onclick={() => goto('/notebooks')}
                >
                    <div class="flex items-center gap-2">
                        <BookOpen class="w-4 h-4" />
                        Open An Analytical Notebook
                    </div>
                    <ArrowRight class="w-4 h-4" />
                </Button>
                <Button 
                    variant="outline" 
                    class="w-full justify-between"
                    onclick={() => goto('/chat')}
                >
                    <div class="flex items-center gap-2">
                        <MessageSquare class="w-4 h-4" />
                        Query Data With AI
                    </div>
                    <ArrowRight class="w-4 h-4" />
                </Button>
            </Card.Content>
        </Card.Root>

        <!-- Recent Activity -->
        <Card.Root>
            <Card.Header>
                <div class="flex items-center justify-between">
                    <div>
                        <Card.Title>Your Ontology</Card.Title>
                    </div>
                    <Button 
                        variant="ghost" 
                        size="sm"
                        class="text-muted-foreground hover:text-foreground"
                        onclick={() => goto('/ontology')}
                    >
                        View All
                        <ArrowRight class="w-4 h-4 ml-2" />
                    </Button>
                </div>
            </Card.Header>
            <Card.Content>
                <div class="space-y-4">
                    <div class="flex items-center justify-between py-2 border-b">
                        <div class="flex items-center gap-3">
                            <div class="w-2 h-2 rounded-full bg-blue-500"></div>
                            <span class="text-sm font-medium">Users</span>
                        </div>
                        <span class="text-xs text-muted-foreground">12 attributes</span>
                    </div>
                    <div class="flex items-center justify-between py-2 border-b">
                        <div class="flex items-center gap-3">
                            <div class="w-2 h-2 rounded-full bg-green-500"></div>
                            <span class="text-sm font-medium">Organizations</span>
                        </div>
                        <span class="text-xs text-muted-foreground">8 attributes</span>
                    </div>
                    <div class="flex items-center justify-between py-2 border-b">
                        <div class="flex items-center gap-3">
                            <div class="w-2 h-2 rounded-full bg-amber-500"></div>
                            <span class="text-sm font-medium">Events</span>
                        </div>
                        <span class="text-xs text-muted-foreground">15 attributes</span>
                    </div>
                    <div class="flex items-center justify-between py-2">
                        <div class="flex items-center gap-3">
                            <div class="w-2 h-2 rounded-full bg-purple-500"></div>
                            <span class="text-sm font-medium">Subscriptions</span>
                        </div>
                        <span class="text-xs text-muted-foreground">6 attributes</span>
                    </div>
                </div>
            </Card.Content>
        </Card.Root>

        <!-- Connected Data Sources -->
        <Card.Root class="col-span-1 md:col-span-2">
            <Card.Header>
                <div class="flex items-center justify-between">
                    <div>
                        <Card.Title>Connected Data Sources</Card.Title>
                    </div>
                    <Button 
                        variant="ghost" 
                        size="sm"
                        class="text-muted-foreground hover:text-foreground"
                        onclick={() => goto('/data-sources')}
                    >
                        Add Source
                        <ArrowRight class="w-4 h-4 ml-2" />
                    </Button>
                </div>
            </Card.Header>
            <Card.Content>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {#if connectedSources.length > 0}
                        {#each connectedSources as source}
                            <div class="flex items-center gap-4 p-4 rounded-lg border bg-card">
                                <img 
                                    src={source.logo}
                                    alt={source.name}
                                    class="w-8 h-8"
                                />
                                <div class="flex-1 min-w-0">
                                    <p class="text-sm font-medium truncate">{source.name}</p>
                                    <p class="text-xs text-muted-foreground">{source.type}</p>
                                    <div class="flex items-center gap-2 mt-1">
                                        <Clock class={`w-3 h-3 text-muted-foreground ${source.syncStatus === 'syncing' ? 'syncing' : ''}`} />
                                        <p class="text-xs text-muted-foreground">
                                            Last sync: {getTimeAgo(source.lastSync)}
                                            {#if source.syncStatus === 'syncing'}
                                                <span class="text-amber-500">(Syncing...)</span>
                                            {/if}
                                        </p>
                                    </div>
                                </div>
                                <div class="h-2 w-2 rounded-full status-dot"></div>
                            </div>
                        {/each}
                    {:else}
                        <div class="col-span-full">
                            <Button
                                variant="outline"
                                class="w-full h-auto p-4 flex items-center gap-4"
                                onclick={() => goto('/data-sources')}
                            >
                                <div class="w-8 h-8 rounded-lg border-2 border-dashed flex items-center justify-center">
                                    <Plus class="w-4 h-4 text-muted-foreground" />
                                </div>
                                <div class="flex-1 text-left">
                                    <p class="text-sm font-medium">Add New Source</p>
                                    <p class="text-xs text-muted-foreground">Connect your first data source</p>
                                </div>
                            </Button>
                        </div>
                    {/if}
                </div>
            </Card.Content>
        </Card.Root>
    </div>
</PageContent> 