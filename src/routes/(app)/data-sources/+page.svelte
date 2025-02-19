<script lang="ts">
    import PageContent from "$lib/components/page-content.svelte";
    import * as Sheet from "$lib/components/ui/sheet";
    import { Input } from "$lib/components/ui/input";
    import { Button } from "$lib/components/ui/button";
    
    interface DataSource {
        id: string;
        name: string;
        description: string;
        category: 'analytics' | 'payment' | 'database' | 'other';
        status: 'available' | 'coming_soon';
        fields: Array<{
            name: string;
            type: 'text' | 'password' | 'file';
            placeholder: string;
            required?: boolean;
            accept?: string;
        }>;
        logoUrl: string;
    }

    const dataSources: DataSource[] = [
        // CSV Upload
        { 
            id: 'csv',
            name: 'CSV Upload',
            description: 'File Import',
            category: 'other',
            status: 'available',
            logoUrl: 'https://cdn-icons-png.flaticon.com/512/6133/6133884.png',
            fields: [
                { 
                    name: 'File', 
                    type: 'file',
                    placeholder: 'Choose a CSV file',
                    required: true,
                    accept: '.csv'
                }
            ]
        },
        // PostgreSQL
        { 
            id: 'postgresql',
            name: 'PostgreSQL',
            description: 'Database Connection',
            category: 'database',
            status: 'available',
            logoUrl: 'https://www.postgresql.org/media/img/about/press/elephant.png',
            fields: [
                { name: 'Host', type: 'text', placeholder: 'localhost', required: true },
                { name: 'Port', type: 'text', placeholder: '5432', required: true },
                { name: 'Database', type: 'text', placeholder: 'database name', required: true },
                { name: 'Username', type: 'text', placeholder: 'username', required: true },
                { name: 'Password', type: 'password', placeholder: 'password', required: true }
            ]
        },
        // PostHog
        { 
            id: 'posthog',
            name: 'PostHog',
            description: 'Product Analytics',
            category: 'analytics',
            status: 'available',
            logoUrl: 'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fassets.stickpng.com%2Fimages%2F62cc4f997755665152a8df88.png&f=1&nofb=1&ipt=2b7108edecdcec3d696fb0e0e5607b696caeb5f5eb9446ba4b33c721aabc0531&ipo=images',
            fields: [
                { name: 'API Key', type: 'text', placeholder: 'Enter your API key', required: true },
                { name: 'Project ID', type: 'text', placeholder: 'Enter your project ID', required: true }
            ]
        },
        // Stripe
        { 
            id: 'stripe',
            name: 'Stripe',
            description: 'Payment Processing',
            category: 'payment',
            status: 'available',
            logoUrl: 'https://cdn.worldvectorlogo.com/logos/stripe-4.svg',
            fields: [
                { name: 'Publishable Key', type: 'text', placeholder: 'pk_...', required: true },
                { name: 'Secret Key', type: 'password', placeholder: 'sk_...', required: true }
            ]
        },
        // Plausible
        { 
            id: 'plausible',
            name: 'Plausible',
            description: 'Web Analytics',
            category: 'analytics',
            status: 'coming_soon',
            logoUrl: 'https://images.saasworthy.com/tr:w-263,h-0/plausibleanalytics_9728_logo_1632464972_2lptx.png',
            fields: [
                { name: 'Site ID', type: 'text', placeholder: 'Enter your site ID', required: true },
                { name: 'API Key', type: 'password', placeholder: 'Enter your API key', required: true }
            ]
        },
        // Google Analytics
        { 
            id: 'ga',
            name: 'Google Analytics',
            description: 'Web Analytics',
            category: 'analytics',
            status: 'coming_soon',
            logoUrl: 'https://www.vectorlogo.zone/logos/google_analytics/google_analytics-icon.svg',
            fields: [
                { name: 'Measurement ID', type: 'text', placeholder: 'G-XXXXXXXXXX', required: true },
                { name: 'API Secret', type: 'password', placeholder: 'Enter your API secret', required: true }
            ]
        },
        // Amplitude
        { 
            id: 'amplitude',
            name: 'Amplitude',
            description: 'Product Analytics',
            category: 'analytics',
            status: 'coming_soon',
            logoUrl: 'https://raw.githubusercontent.com/gilbarbara/logos/main/logos/amplitude-icon.svg',
            fields: [
                { name: 'API Key', type: 'text', placeholder: 'Enter your API key', required: true },
                { name: 'Secret Key', type: 'password', placeholder: 'Enter your secret key', required: true }
            ]
        },
        // Mixpanel
        { 
            id: 'mixpanel',
            name: 'Mixpanel',
            description: 'Product Analytics',
            category: 'analytics',
            status: 'coming_soon',
            logoUrl: 'https://cdn.worldvectorlogo.com/logos/mixpanel.svg',
            fields: [
                { name: 'Project Token', type: 'text', placeholder: 'Enter your project token', required: true },
                { name: 'API Secret', type: 'password', placeholder: 'Enter your API secret', required: true }
            ]
        },
        // Segment
        { 
            id: 'segment',
            name: 'Segment',
            description: 'Customer Data Platform',
            category: 'analytics',
            status: 'coming_soon',
            logoUrl: 'https://cdn.worldvectorlogo.com/logos/segment.svg',
            fields: [
                { name: 'Write Key', type: 'text', placeholder: 'Enter your write key', required: true },
                { name: 'Space ID', type: 'text', placeholder: 'Enter your space ID', required: true }
            ]
        }
    ];

    const officialConnectors = dataSources;

    let selectedSource: DataSource | null = null;
    let isSheetOpen = false;

    function openSheet(source: DataSource) {
        selectedSource = source;
        isSheetOpen = true;
    }

    function closeSheet() {
        isSheetOpen = false;
        selectedSource = null;
    }

    // Form handling
    let formData: Record<string, string> = {};
    
    function handleConnect() {
        console.log('Connecting with data:', formData);
        // TODO: Implement connection logic
        closeSheet();
    }
</script>

<PageContent>

    <div>
        <h1 class="font-orbitron text-2xl font-semibold tracking-wide">
            Data Sources
        </h1>
        <p class="text-sm text-muted-foreground mt-1">
            Connect your data sources to start gaining deeper insights with Clairvoyance.
        </p>
    </div>

    <div class="mt-10">
        <div class="mb-6">
            <h2 class="text-lg font-semibold">Official Connectors</h2>
            <p class="text-sm text-muted-foreground mt-1">
                First-party integrations maintained by Auriel Analytics
            </p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {#each officialConnectors as source}
                <button
                    class="p-6 border rounded-lg hover:border-primary transition-colors flex flex-col items-center gap-4 bg-card relative"
                    on:click={() => source.status === 'available' && openSheet(source)}
                    disabled={source.status !== 'available'}
                >
                    {#if source.status === 'coming_soon'}
                        <div class="absolute top-2 right-2 bg-muted px-2 py-1 rounded-full text-xs text-muted-foreground">
                            Coming Soon
                        </div>
                    {/if}
                    
                    <img 
                        src={source.logoUrl}
                        alt={source.name}
                        class="w-12 h-12 object-contain {source.status !== 'available' ? 'opacity-50' : ''}"
                    />
                    <div class="text-center">
                        <h3 class="font-semibold">{source.name}</h3>
                        <p class="text-sm text-muted-foreground">{source.description}</p>
                    </div>
                </button>
            {/each}
        </div>
    </div>

    <!-- Add community connectors section after official connectors -->
    <div class="mt-10">
        <div class="mb-6">
            <h2 class="text-lg font-semibold">Community Connectors</h2>
            <p class="text-sm text-muted-foreground mt-1">
                Community-contributed integrations
            </p>
        </div>
        
        {#if dataSources.some(d => d.category === 'community')}
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {#each dataSources.filter(d => d.category === 'community') as source}
                    <!-- Connector card template -->
                {/each}
            </div>
        {:else}
            <div class="border border-dashed rounded-lg p-8 text-center">
                <p class="text-muted-foreground font-light">
                    No community connectors available yet
                </p>
            </div>
        {/if}
    </div>
</PageContent>

{#if selectedSource}
    <Sheet.Root bind:open={isSheetOpen}>
        <Sheet.Content class="sm:max-w-[600px]">
            <Sheet.Header>
                <Sheet.Title>{selectedSource.name} Integration</Sheet.Title>
                <Sheet.Description>
                    Configure your {selectedSource.name} connection settings below.
                </Sheet.Description>
            </Sheet.Header>

            <div class="py-6">
                <form class="space-y-6" on:submit|preventDefault={handleConnect}>
                    {#each selectedSource.fields as field}
                        <div class="space-y-2">
                            <label for={field.name} class="text-sm font-medium">
                                {field.name}
                            </label>
                            {#if field.type === 'file'}
                                <div class="flex flex-col gap-4">
                                    <div 
                                        class="border-2 border-dashed rounded-lg p-4 h-32 flex items-center justify-center bg-muted/50"
                                    >
                                        {#if formData[field.name]}
                                            <div class="text-center">
                                                <p class="text-sm font-medium">{formData[field.name].name}</p>
                                            </div>
                                        {:else}
                                            <p class="text-sm text-muted-foreground text-center">
                                                No file selected
                                            </p>
                                        {/if}
                                    </div>
                                    <div>
                                        <input
                                            type="file"
                                            id={field.name}
                                            accept={field.accept}
                                            required={field.required}
                                            class="hidden"
                                            on:change={(e) => formData[field.name] = e.target.files[0]}
                                        />
                                        <button 
                                            type="button" 
                                            class="px-4 py-2 border rounded-md text-sm hover:bg-muted font-semibold"
                                            on:click={() => document.querySelector(`#${field.name}`).click()}
                                        >
                                            Upload File
                                        </button>
                                    </div>
                                </div>
                            {:else}
                                <Input
                                    type={field.type}
                                    id={field.name}
                                    placeholder={field.placeholder}
                                    required={field.required}
                                    bind:value={formData[field.name]}
                                />
                            {/if}
                        </div>
                    {/each}
                </form>
            </div>

            <Sheet.Footer>
                <div class="flex gap-2">
                    <Button variant="outline" on:click={closeSheet}>
                        Cancel
                    </Button>
                    <Button on:click={handleConnect}>
                        Connect
                    </Button>
                </div>
            </Sheet.Footer>
        </Sheet.Content>
    </Sheet.Root>
{/if} 