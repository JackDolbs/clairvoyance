<script lang="ts">
    import PageContent from "$lib/components/page-content.svelte";
    import { Button } from "$lib/components/ui/button";
    import * as Tabs from "$lib/components/ui/tabs";
    import * as Table from "$lib/components/ui/table";
    import Plus from "lucide-svelte/icons/plus";
    import Edit from "lucide-svelte/icons/edit";
    import Trash from "lucide-svelte/icons/trash";
    import Link from "lucide-svelte/icons/link";
    import * as Dialog from "$lib/components/ui/dialog";
    import FileUp from "lucide-svelte/icons/file-up";
    import FileDown from "lucide-svelte/icons/file-down";
    import { Separator } from "$lib/components/ui/separator";
    import Code from "lucide-svelte/icons/code";
    import { Input } from "$lib/components/ui/input";
    import { Checkbox } from "$lib/components/ui/checkbox";
    import { Badge } from "$lib/components/ui/badge";
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
    import Filter from "lucide-svelte/icons/filter";
    import ArrowRight from "lucide-svelte/icons/arrow-right";
    import Check from "lucide-svelte/icons/check";
    import ontologySchema from './ontology.json';
    import * as Menubar from "$lib/components/ui/menubar/index.js";
    import ZoomIn from "lucide-svelte/icons/zoom-in";
    import ZoomOut from "lucide-svelte/icons/zoom-out";
    import Focus from "lucide-svelte/icons/focus";
    import Maximize2 from "lucide-svelte/icons/maximize-2";
    import Minimize2 from "lucide-svelte/icons/minimize-2";
    import { onMount } from "svelte";
    import Download from "lucide-svelte/icons/download";
    import Settings from "lucide-svelte/icons/settings";

    // Define ontology structure
    const ontologyClasses = [
        {
            id: 'organization',
            name: 'Organization',
            description: 'A company or business entity using the SaaS platform',
            properties: [
                { name: 'industry', type: 'string', required: true },
                { name: 'employees', type: 'number', required: true },
                { name: 'annualRevenue', type: 'string', required: false },
                { name: 'region', type: 'string', required: true },
                { name: 'customerSince', type: 'date', required: true },
                { name: 'status', type: 'enum', required: true }
            ],
            relationships: [
                { target: 'department', type: 'hasMany', name: 'departments' },
                { target: 'subscription', type: 'hasMany', name: 'subscriptions' },
                { target: 'user', type: 'hasMany', name: 'users' }
            ]
        },
        {
            id: 'department',
            name: 'Department',
            description: 'Organizational unit within a company',
            properties: [
                { name: 'name', type: 'string', required: true },
                { name: 'headcount', type: 'number', required: true },
                { name: 'budget', type: 'number', required: false },
                { name: 'location', type: 'string', required: false }
            ],
            relationships: [
                { target: 'organization', type: 'belongsTo', name: 'organization' },
                { target: 'user', type: 'hasMany', name: 'members' }
            ]
        },
        {
            id: 'user',
            name: 'User',
            description: 'End user of the platform',
            properties: [
                { name: 'email', type: 'string', required: true },
                { name: 'role', type: 'enum', required: true },
                { name: 'lastLogin', type: 'datetime', required: false },
                { name: 'preferences', type: 'json', required: false }
            ],
            relationships: [
                { target: 'organization', type: 'belongsTo', name: 'organization' },
                { target: 'department', type: 'belongsTo', name: 'department' },
                { target: 'session', type: 'hasMany', name: 'sessions' }
            ]
        },
        {
            id: 'product_module',
            name: 'Product Module',
            description: 'Core functional module of the platform',
            properties: [
                { name: 'name', type: 'string', required: true },
                { name: 'version', type: 'string', required: true },
                { name: 'status', type: 'enum', required: true },
                { name: 'releaseDate', type: 'date', required: true }
            ],
            relationships: [
                { target: 'feature', type: 'hasMany', name: 'features' },
                { target: 'subscription', type: 'belongsToMany', name: 'subscriptions' }
            ]
        },
        {
            id: 'subscription',
            name: 'Subscription',
            description: 'Product subscription and billing plan',
            properties: [
                { name: 'plan', type: 'enum', required: true },
                { name: 'startDate', type: 'date', required: true },
                { name: 'endDate', type: 'date', required: false },
                { name: 'seats', type: 'number', required: true },
                { name: 'billingCycle', type: 'enum', required: true }
            ],
            relationships: [
                { target: 'organization', type: 'belongsTo', name: 'organization' },
                { target: 'product_module', type: 'hasMany', name: 'modules' },
                { target: 'invoice', type: 'hasMany', name: 'invoices' }
            ]
        }
    ];

    const relationshipTypes = [
        { 
            id: 'belongs_to',
            name: 'Belongs To',
            description: 'One-to-many ownership relationship',
            sourceTypes: ['department', 'user', 'subscription'],
            targetTypes: ['organization', 'department']
        },
        { 
            id: 'has_many',
            name: 'Has Many',
            description: 'One-to-many collection relationship',
            sourceTypes: ['organization', 'department', 'product_module'],
            targetTypes: ['user', 'department', 'feature', 'subscription']
        },
        { 
            id: 'belongs_to_many',
            name: 'Belongs To Many',
            description: 'Many-to-many relationship',
            sourceTypes: ['product_module', 'feature'],
            targetTypes: ['subscription', 'user']
        },
        { 
            id: 'uses',
            name: 'Uses',
            description: 'Usage tracking relationship',
            sourceTypes: ['user'],
            targetTypes: ['product_module', 'feature']
        },
        { 
            id: 'manages',
            name: 'Manages',
            description: 'Administrative relationship',
            sourceTypes: ['user'],
            targetTypes: ['department', 'product_module']
        }
    ];

    // Add state for dialog
    let csvDialogOpen = false;
    let jsonContent = JSON.stringify(ontologySchema, null, 2);

    // Add state for table features
    let searchQuery = '';
    let selectedClasses = ontologyClasses.map(c => ({ ...c, selected: true }));

    // Add filtering logic
    $: filteredClasses = selectedClasses
        .filter(c => c.selected)
        .filter(c => 
            c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.description.toLowerCase().includes(searchQuery.toLowerCase())
        );

    // Add export and import functions
    function exportSchema() {
        // Implementation of exportSchema
    }

    function importSchema() {
        // Implementation of importSchema
    }

    // Add these variables for the resizer
    let isResizing = false;
    let leftPaneWidth = 30; // Initial width in percentage

    function startResizing() {
        isResizing = true;
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', stopResizing);
    }

    function stopResizing() {
        isResizing = false;
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', stopResizing);
    }

    function handleMouseMove(e: MouseEvent) {
        if (!isResizing) return;
        
        const container = document.getElementById('split-container');
        if (!container) return;

        const containerRect = container.getBoundingClientRect();
        const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
        
        // Constrain the width between 20% and 40%
        leftPaneWidth = Math.min(Math.max(newWidth, 20), 40);
    }

    function formatJSON() {
        try {
            const parsed = JSON.parse(jsonContent);
            jsonContent = JSON.stringify(parsed, null, 2);
        } catch (e) {
            console.error('Invalid JSON format');
        }
    }

    function validateSchema() {
        try {
            const parsed = JSON.parse(jsonContent);
            // Add validation logic here if needed
        } catch (e) {
            console.error('Invalid JSON format');
        }
    }

    function saveSchema() {
        try {
            const parsed = JSON.parse(jsonContent);
            // Add save logic here
            csvDialogOpen = false;
        } catch (e) {
            console.error('Invalid JSON format');
        }
    }

    // Add these variables near the top of your script section:
    let showLineNumbers = true;
    let showMinimap = false;

    // Add these variables near the top of your script section, after the imports:
    let zoomLevel = 100;
    let isFullscreen = false;

    // Add zoom control functions
    function zoomIn() {
        zoomLevel = Math.min(zoomLevel + 10, 200);
    }

    function zoomOut() {
        zoomLevel = Math.max(zoomLevel - 10, 50);
    }

    function resetZoom() {
        zoomLevel = 100;
    }

    // Add fullscreen toggle function
    async function toggleFullscreen() {
        if (!document.fullscreenElement) {
            // Target the Dialog content container
            const dialogContent = document.querySelector('[role="dialog"]');
            if (dialogContent) {
                await dialogContent.requestFullscreen();
                isFullscreen = true;
            }
        } else {
            await document.exitFullscreen();
            isFullscreen = false;
        }
    }

    // Add fullscreen change listener
    onMount(() => {
        document.addEventListener('fullscreenchange', () => {
            isFullscreen = !!document.fullscreenElement;
        });

        return () => {
            document.removeEventListener('fullscreenchange', () => {
                isFullscreen = !!document.fullscreenElement;
            });
        };
    });

    // Add rotate graph function
    function rotateGraph() {
        // Implementation of rotateGraph
    }

    // Add focus first node function
    function focusFirstNode() {
        // Implementation of focusFirstNode
    }

    // Add this state variable in your script section
    let downloadDialogOpen = false;

    // Add these state variables in the script section
    let enableTrackpadGestures = true;
    let showJsonEditor = true;
    let enableAutoSave = false;
</script>

<style>
    /* Custom scrollbar styles */
    :global(textarea::-webkit-scrollbar) {
        width: 8px;
    }

    :global(textarea::-webkit-scrollbar-track) {
        background: transparent;
    }

    :global(textarea::-webkit-scrollbar-thumb) {
        background-color: hsl(var(--secondary-foreground) / 0.2);
        border-radius: 4px;
    }

    :global(textarea::-webkit-scrollbar-thumb:hover) {
        background-color: hsl(var(--secondary-foreground) / 0.4);
    }

    /* Firefox */
    :global(textarea) {
        scrollbar-width: thin;
        scrollbar-color: hsl(var(--secondary-foreground) / 0.2) transparent;
    }

    /* Fullscreen styles */
    :global([role="dialog"]:fullscreen) {
        background-color: hsl(var(--background));
        padding: 1.5rem;
    }

    :global([role="dialog"]:fullscreen .split-container) {
        height: calc(100vh - 12rem);
    }
</style>

<PageContent>
    <div class="space-y-6">
        <div class="flex items-center justify-between mb-6">
            <div>
                <h1 class="font-orbitron text-2xl font-semibold tracking-wide">
                    Ontology
                </h1>
                <p class="text-sm text-muted-foreground mt-1">
                    Design your data model by defining classes, relationships, and validation rules. 
                </p>
            </div>
            <div class="flex items-center gap-2">
                <Button variant="outline" onclick={() => csvDialogOpen = true}>
                    <Code class="h-4 w-4 mr-2" />
                    Edit Full Schema
                </Button>
                <Button>
                    <Plus class="h-4 w-4 mr-2" />
                    Add Class
                </Button>
            </div>
        </div>

        <!-- Add CSV Dialog -->
        <Dialog.Root bind:open={csvDialogOpen}>
            <Dialog.Content class="max-w-[90vw] h-[90vh] flex flex-col">
                <Dialog.Header>
                    <Dialog.Title>Edit Full Schema</Dialog.Title>
                    <Dialog.Description>
                        Edit the complete ontology structure in JSON format. This includes all classes, relationships, and validation rules.
                    </Dialog.Description>
                </Dialog.Header>

                <div class="flex-1 flex flex-col h-full overflow-hidden">
                    <!-- Replace the top buttons section with Menubar -->
                    <div class="mb-4">
                        <Menubar.Root class="flex justify-between">
                            <!-- Left side menus -->
                            <div class="flex items-center">
                                <!-- Add the "Editing:" label -->
                                <span class="text-sm text-muted-foreground px-3">
                                    Editing: {ontologySchema.ontology.name}
                                </span>

                                <Separator orientation="vertical" class="mx-1 h-6" />

                                <!-- Existing menu items -->
                                <Menubar.Menu>
                                    <Menubar.Trigger>File</Menubar.Trigger>
                                    <Menubar.Content>
                                        <Menubar.Item onclick={exportSchema}>
                                            Export Schema
                                            <Menubar.Shortcut>⌘E</Menubar.Shortcut>
                                        </Menubar.Item>
                                        <Menubar.Item onclick={importSchema}>
                                            Import Schema
                                            <Menubar.Shortcut>⌘I</Menubar.Shortcut>
                                        </Menubar.Item>
                                        <Menubar.Separator />
                                        <Menubar.Item onclick={formatJSON}>
                                            Format JSON
                                            <Menubar.Shortcut>⌘⇧F</Menubar.Shortcut>
                                        </Menubar.Item>
                                        <Menubar.Item onclick={validateSchema}>
                                            Validate Schema
                                            <Menubar.Shortcut>⌘V</Menubar.Shortcut>
                                        </Menubar.Item>
                                        <Menubar.Separator />
                                        <Menubar.Item onclick={saveSchema}>
                                            Save
                                            <Menubar.Shortcut>⌘S</Menubar.Shortcut>
                                        </Menubar.Item>
                                    </Menubar.Content>
                                </Menubar.Menu>

                                <Menubar.Menu>
                                    <Menubar.Trigger>View</Menubar.Trigger>
                                    <Menubar.Content>
                                        <Menubar.Item onclick={rotateGraph}>
                                            Rotate Graph
                                            <Menubar.Shortcut>⌘R</Menubar.Shortcut>
                                        </Menubar.Item>
                                        <Menubar.Item onclick={focusFirstNode}>
                                            Focus First Node
                                            <Menubar.Shortcut>⌘F</Menubar.Shortcut>
                                        </Menubar.Item>
                                        <Menubar.Separator />
                                        <Menubar.CheckboxItem bind:checked={showLineNumbers}>
                                            Line Numbers
                                            <Menubar.Shortcut>⌘L</Menubar.Shortcut>
                                        </Menubar.CheckboxItem>
                                    </Menubar.Content>
                                </Menubar.Menu>

                                <Menubar.Menu>
                                    <Menubar.Trigger>Settings</Menubar.Trigger>
                                    <Menubar.Content>
                                        <Menubar.CheckboxItem bind:checked={enableTrackpadGestures}>
                                            Enable Trackpad Gestures
                                            <Menubar.Shortcut>⌘G</Menubar.Shortcut>
                                        </Menubar.CheckboxItem>
                                        <Menubar.CheckboxItem bind:checked={showJsonEditor}>
                                            Show JSON Editor
                                            <Menubar.Shortcut>⌘J</Menubar.Shortcut>
                                        </Menubar.CheckboxItem>
                                        <Menubar.Separator />
                                        <Menubar.CheckboxItem bind:checked={enableAutoSave}>
                                            Enable Auto-Save
                                            <Menubar.Shortcut>⌘A</Menubar.Shortcut>
                                        </Menubar.CheckboxItem>
                                    </Menubar.Content>
                                </Menubar.Menu>
                            </div>

                            <!-- Right side controls -->
                            <div class="flex items-center gap-2 px-2">
                                <Button variant="ghost" size="icon" onclick={() => downloadDialogOpen = true}>
                                    <Download class="h-4 w-4" />
                                </Button>

                                <Separator orientation="vertical" class="mx-1 h-6" />

                                <Button variant="ghost" size="icon" onclick={zoomIn}>
                                    <ZoomIn class="h-4 w-4" />
                                </Button>

                                <div class="w-[40px] text-center text-sm">
                                    {zoomLevel}%
                                </div>

                                <Button variant="ghost" size="icon" onclick={zoomOut}>
                                    <ZoomOut class="h-4 w-4" />
                                </Button>

                                <Separator orientation="vertical" class="mx-1 h-6" />

                                <Button variant="ghost" size="icon" onclick={resetZoom}>
                                    <Focus class="h-4 w-4" />
                                </Button>

                                <Separator orientation="vertical" class="mx-1 h-6" />

                                <Button variant="ghost" size="icon" onclick={toggleFullscreen}>
                                    {#if isFullscreen}
                                        <Minimize2 class="h-4 w-4" />
                                    {:else}
                                        <Maximize2 class="h-4 w-4" />
                                    {/if}
                                </Button>
                            </div>
                        </Menubar.Root>
                    </div>

                    <Separator class="mb-4" />

                    <!-- Split container - make it take up remaining space -->
                    <div 
                        id="split-container"
                        class="border rounded-2xl flex flex-1 min-h-0"
                    >
                        <!-- Left Pane (JSON Editor) -->
                        <div 
                            class="relative"
                            style="width: {leftPaneWidth}%"
                        >
                            <textarea 
                                class="w-full h-full font-mono text-sm p-4 rounded-md bg-secondary/20 resize-none absolute inset-0"
                                bind:value={jsonContent}
                                placeholder="Enter your ontology schema in JSON format..."
                            ></textarea>
                        </div>

                        <!-- Resizer -->
                        <div
                            class="w-1 hover:w-2 bg-border hover:bg-primary transition-all cursor-col-resize flex-shrink-0 relative"
                            on:mousedown={startResizing}
                            role="separator"
                            aria-orientation="vertical"
                            aria-valuenow={leftPaneWidth}
                        >
                            <div class="absolute inset-y-0 -left-2 right-0"></div>
                        </div>

                        <!-- Right Pane (Graph Visualization) -->
                        <div class="flex-1 relative">
                            <div class="absolute inset-0 bg-secondary/20 rounded-md">
                                <!-- Double grid background -->
                                <div class="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px),linear-gradient(to_right,#1f2937_0.5px,transparent_0.5px),linear-gradient(to_bottom,#1f2937_0.5px,transparent_0.5px)] bg-[size:48px_48px,48px_48px,12px_12px,12px_12px] opacity-[0.06]"></div>
                                
                                <!-- Content container -->
                                <div class="relative h-full flex items-center justify-center text-muted-foreground p-4">
                                    <!-- Add your graph visualization component here -->
                                    <p>Graph visualization will be rendered here</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <Dialog.Footer>
                    <Button variant="outline" onclick={() => csvDialogOpen = false}>
                        Cancel
                    </Button>
                    <Button onclick={saveSchema}>
                        Save Changes
                    </Button>
                </Dialog.Footer>
            </Dialog.Content>
        </Dialog.Root>

        <!-- Add this new Dialog after your existing Dialog.Root -->
        <Dialog.Root bind:open={downloadDialogOpen}>
            <Dialog.Content class="sm:max-w-[425px]">
                <Dialog.Header>
                    <Dialog.Title>Download Graph</Dialog.Title>
                    <Dialog.Description>
                        Choose the format to download the graph visualization.
                    </Dialog.Description>
                </Dialog.Header>
                <div class="grid gap-4 py-4">
                    <div class="grid grid-cols-4 items-center gap-4">
                        <label for="format" class="text-sm font-medium leading-none col-span-4">
                            Format
                        </label>
                        <select 
                            id="format"
                            class="col-span-4 flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors"
                        >
                            <option value="svg">SVG</option>
                            <option value="png">PNG</option>
                            <option value="jpg">JPG</option>
                        </select>
                    </div>
                    <div class="grid grid-cols-4 items-center gap-4">
                        <label class="text-sm font-medium leading-none col-span-4">
                            Options
                        </label>
                        <div class="col-span-4 space-y-2">
                            <label class="flex items-center gap-2">
                                <Checkbox />
                                <span class="text-sm">Include background grid</span>
                            </label>
                            <label class="flex items-center gap-2">
                                <Checkbox />
                                <span class="text-sm">Include legend</span>
                            </label>
                        </div>
                    </div>
                </div>
                <Dialog.Footer>
                    <Button variant="outline" onclick={() => downloadDialogOpen = false}>
                        Cancel
                    </Button>
                    <Button onclick={() => {
                        // Add download logic here
                        downloadDialogOpen = false;
                    }}>
                        Download
                    </Button>
                </Dialog.Footer>
            </Dialog.Content>
        </Dialog.Root>

        <!-- Main Content -->
        <Tabs.Root value="classes" defaultValue="classes" class="w-full">
            <Tabs.List class="border-b">
                <Tabs.Trigger value="classes" class="px-4 py-2 -mb-px">
                    Classes
                    <span class="ml-2 text-xs text-muted-foreground">({ontologyClasses.length})</span>
                </Tabs.Trigger>
                <Tabs.Trigger value="relationships" class="px-4 py-2 -mb-px">
                    Relationships
                    <span class="ml-2 text-xs text-muted-foreground">({relationshipTypes.length})</span>
                </Tabs.Trigger>
                <Tabs.Trigger value="validation" class="px-4 py-2 -mb-px">Validation Rules</Tabs.Trigger>
            </Tabs.List>

            <!-- Classes Tab -->
            <Tabs.Content value="classes" class="pt-4">
                <div class="flex items-center justify-between mb-4">
                    <h2 class="text-lg font-medium mb-1">Data Classes</h2>
                    <div class="flex items-center gap-2">
                        <Input 
                            type="text" 
                            placeholder="Search classes..." 
                            bind:value={searchQuery}
                            class="w-64"
                        />
                        <DropdownMenu.Root>
                            <DropdownMenu.Trigger asChild>
                                <div>
                                    <Button variant="outline" size="sm">
                                        <Filter class="h-4 w-4 mr-2" />
                                        Filter
                                    </Button>
                                </div>
                            </DropdownMenu.Trigger>
                            <DropdownMenu.Content>
                                <DropdownMenu.Label>Show Classes</DropdownMenu.Label>
                                {#each selectedClasses as cls}
                                    <DropdownMenu.CheckboxItem
                                        checked={cls.selected}
                                        onCheckedChange={(checked) => cls.selected = checked}
                                    >
                                        {cls.name}
                                    </DropdownMenu.CheckboxItem>
                                {/each}
                            </DropdownMenu.Content>
                        </DropdownMenu.Root>
                    </div>
                </div>
                <div class="grid grid-cols-4 gap-4 mb-6">
                    <div class="p-4 bg-secondary/20 rounded-lg">
                        <div class="text-sm text-muted-foreground">Total Classes</div>
                        <div class="text-2xl font-semibold">{ontologyClasses.length}</div>
                    </div>
                    <div class="p-4 bg-secondary/20 rounded-lg">
                        <div class="text-sm text-muted-foreground">Total Properties</div>
                        <div class="text-2xl font-semibold">
                            {ontologyClasses.reduce((acc, c) => acc + c.properties.length, 0)}
                        </div>
                    </div>
                    <div class="p-4 bg-secondary/20 rounded-lg">
                        <div class="text-sm text-muted-foreground">Total Relationships</div>
                        <div class="text-2xl font-semibold">
                            {ontologyClasses.reduce((acc, c) => acc + c.relationships.length, 0)}
                        </div>
                    </div>
                    <div class="p-4 bg-secondary/20 rounded-lg">
                        <div class="text-sm text-muted-foreground">Required Properties</div>
                        <div class="text-2xl font-semibold">
                            {ontologyClasses.reduce((acc, c) => 
                                acc + c.properties.filter(p => p.required).length, 0
                            )}
                        </div>
                    </div>
                </div>
                <div class="mt-4">
                    <Table.Root>
                        <Table.Header>
                            <Table.Row>
                                <Table.Head>Name</Table.Head>
                                <Table.Head>Description</Table.Head>
                                <Table.Head>Properties</Table.Head>
                                <Table.Head>Relationships</Table.Head>
                                <Table.Head class="w-[100px]">Actions</Table.Head>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {#each filteredClasses as ontologyClass}
                                <Table.Row>
                                    <Table.Cell class="font-medium">{ontologyClass.name}</Table.Cell>
                                    <Table.Cell>{ontologyClass.description}</Table.Cell>
                                    <Table.Cell>
                                        <div class="flex flex-wrap gap-1">
                                            {#each ontologyClass.properties as prop}
                                                <Badge 
                                                    variant={prop.required ? 'default' : 'secondary'}
                                                    class="flex items-center gap-1"
                                                >
                                                    {prop.name}
                                                    <span class="text-xs opacity-80">({prop.type})</span>
                                                </Badge>
                                            {/each}
                                        </div>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <div class="flex flex-wrap gap-1">
                                            {#each ontologyClass.relationships as rel}
                                                <Badge 
                                                    variant="outline" 
                                                    class="flex items-center gap-1"
                                                >
                                                    <span class="font-medium">{rel.name}</span>
                                                    <ArrowRight class="h-3 w-3" />
                                                    <span>{rel.target}</span>
                                                    <span class="text-xs opacity-80">({rel.type})</span>
                                                </Badge>
                                            {/each}
                                        </div>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <div class="flex items-center gap-2">
                                            <Button variant="ghost" size="icon">
                                                <Edit class="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon">
                                                <Trash class="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </Table.Cell>
                                </Table.Row>
                            {/each}
                        </Table.Body>
                    </Table.Root>
                </div>
            </Tabs.Content>

            <!-- Relationships Tab -->
            <Tabs.Content value="relationships" class="pt-4">
                <div class="mb-4">
                    <h2 class="text-lg font-medium mb-1">Relationship Types</h2>
                    <p class="text-sm text-muted-foreground">
                        Define how different classes can be connected. These relationships form the structure of your knowledge graph.
                    </p>
                </div>
                <div class="mt-4">
                    <Table.Root>
                        <Table.Header>
                            <Table.Row>
                                <Table.Head>Name</Table.Head>
                                <Table.Head>Description</Table.Head>
                                <Table.Head>Source Types</Table.Head>
                                <Table.Head>Target Types</Table.Head>
                                <Table.Head class="w-[100px]">Actions</Table.Head>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {#each relationshipTypes as rel}
                                <Table.Row>
                                    <Table.Cell class="font-medium">{rel.name}</Table.Cell>
                                    <Table.Cell>{rel.description}</Table.Cell>
                                    <Table.Cell>
                                        <div class="flex flex-wrap gap-1">
                                            {#each rel.sourceTypes as type}
                                                <span class="text-xs bg-secondary px-2 py-1 rounded">
                                                    {type}
                                                </span>
                                            {/each}
                                        </div>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <div class="flex flex-wrap gap-1">
                                            {#each rel.targetTypes as type}
                                                <span class="text-xs bg-secondary px-2 py-1 rounded">
                                                    {type}
                                                </span>
                                            {/each}
                                        </div>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <div class="flex items-center gap-2">
                                            <Button variant="ghost" size="icon">
                                                <Edit class="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon">
                                                <Trash class="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </Table.Cell>
                                </Table.Row>
                            {/each}
                        </Table.Body>
                    </Table.Root>
                </div>
            </Tabs.Content>

            <!-- Validation Rules Tab -->
            <Tabs.Content value="validation" class="pt-4">
                <div class="mb-4">
                    <h2 class="text-lg font-medium mb-1">Validation Rules</h2>
                    <p class="text-sm text-muted-foreground">
                        Set constraints and validation rules to ensure data integrity across your ontology.
                    </p>
                </div>
                <div class="mt-4">
                    <!-- Add validation rules management here -->
                </div>
            </Tabs.Content>
        </Tabs.Root>
    </div>
</PageContent> 