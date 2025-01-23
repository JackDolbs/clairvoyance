<script lang="ts">
    import { Button } from "$lib/components/ui/button";
    import { Separator } from "$lib/components/ui/separator";
    import ZoomIn from "lucide-svelte/icons/zoom-in";
    import ZoomOut from "lucide-svelte/icons/zoom-out";
    import Focus from "lucide-svelte/icons/focus";
    import Download from "lucide-svelte/icons/download";
    import Upload from "lucide-svelte/icons/upload";
    import * as d3 from "d3";
    import { onMount } from "svelte";
    import Plus from "lucide-svelte/icons/plus";
    import Minus from "lucide-svelte/icons/minus";
    import Hand from "lucide-svelte/icons/hand";
    import Circle from "lucide-svelte/icons/circle";
    import MinusIcon from "lucide-svelte/icons/minus";
    import Settings from "lucide-svelte/icons/settings";
    import { Tabs, TabsList, TabsTrigger, TabsContent } from "$lib/components/ui/tabs";
    import { slide } from 'svelte/transition';
    import { page } from "$app/stores";
    import * as Sheet from "$lib/components/ui/sheet";
    import ChevronLeft from "lucide-svelte/icons/chevron-left";
    import * as ScrollArea from "$lib/components/ui/scroll-area";
    import Search from "lucide-svelte/icons/search";
    import Filter from "lucide-svelte/icons/filter";
    import Network from "lucide-svelte/icons/network";
    import * as Tooltip from "$lib/components/ui/tooltip";
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
    import { TooltipProvider } from "$lib/components/ui/tooltip";
    import { browser } from '$app/environment';

    // Add tool state
    let currentTool: 'pan' | 'node' | 'edge' | 'select' = 'pan';
    let sheetOpen = false;
    let selectedNode: any = null;
    
    // Add node types for your ontology
    const nodeTypes = [
        { id: 'entity', name: 'Entity', color: '#4CAF50' },
        { id: 'attribute', name: 'Attribute', color: '#2196F3' },
        { id: 'relationship', name: 'Relationship', color: '#FFC107' },
        { id: 'event', name: 'Event', color: '#9C27B0' }
    ];

    // Mock data for the graph
    const mockData = {
        nodes: [
            { 
                id: "Customer", 
                group: 1, 
                type: 'entity',
                properties: {
                    description: 'A person or organization that purchases products',
                    attributes: ['name', 'email', 'address']
                }
            },
            { id: "Order", group: 2 },
            { id: "Product", group: 3 },
            { id: "Category", group: 3 },
            { id: "Supplier", group: 4 },
            { id: "Payment", group: 2 },
        ],
        links: [
            { source: "Customer", target: "Order", value: 1 },
            { source: "Order", target: "Product", value: 1 },
            { source: "Product", target: "Category", value: 1 },
            { source: "Product", target: "Supplier", value: 1 },
            { source: "Order", target: "Payment", value: 1 },
        ]
    };

    let svgContainer: HTMLDivElement;
    let svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
    let g: d3.Selection<SVGGElement, unknown, null, undefined>;
    let zoomLevel = 100;
    let width: number;
    let height: number;

    // Create zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.1, 4])
        .on("zoom", (event) => {
            g.attr("transform", event.transform);
            zoomLevel = Math.round(event.transform.k * 100);
        });

    // Zoom control functions
    const zoomIn = () => {
        svg.transition()
            .duration(300)
            .call(zoom.scaleBy, 1.2);
    };

    const zoomOut = () => {
        svg.transition()
            .duration(300)
            .call(zoom.scaleBy, 0.8);
    };

    const resetZoom = () => {
        svg.transition()
            .duration(300)
            .call(zoom.transform, d3.zoomIdentity);
    };

    // Make these reactive with $: syntax
    $: console.log('Sidebar state:', { sheetOpen, selectedNode });

    // Add collapsible state
    let isCollapsed = false;
    let sidebarWidth = isCollapsed ? 64 : 240;

    function toggleSidebar() {
        isCollapsed = !isCollapsed;
        sidebarWidth = isCollapsed ? 64 : 240;
    }

    // Single source of truth for which dropdown is open
    type ActiveDropdown = 'filter' | 'relationship' | 'search' | null;
    let activeDropdown: ActiveDropdown = null;

    // Function to handle dropdown toggling
    function toggleDropdown(dropdown: ActiveDropdown) {
        // If clicking the same dropdown, close it
        if (activeDropdown === dropdown) {
            activeDropdown = null;
        } else {
            // If clicking a different dropdown, close the current one and open the new one
            activeDropdown = dropdown;
        }
    }

    // Function to close all dropdowns
    function closeDropdowns() {
        activeDropdown = null;
    }

    // Add click outside handler
    function handleClickOutside(event: MouseEvent) {
        const target = event.target as HTMLElement;
        if (!target.closest('.sidebar-container') && !target.closest('.dropdown-portal')) {
            closeDropdowns();
        }
    }

    onMount(() => {
        // Initialize SVG
        width = svgContainer.clientWidth;
        height = svgContainer.clientHeight;

        svg = d3.select(svgContainer)
            .append("svg")
            .attr("width", "100%")
            .attr("height", "100%")
            .call(zoom);

        g = svg.append("g");

        // Create force simulation
        const simulation = d3.forceSimulation(mockData.nodes as any)
            .force("link", d3.forceLink(mockData.links).id((d: any) => d.id))
            .force("charge", d3.forceManyBody().strength(-1000))
            .force("center", d3.forceCenter(width / 2, height / 2));

        // Create links
        const link = g.append("g")
            .selectAll("line")
            .data(mockData.links)
            .join("line")
            .attr("stroke", "#999")
            .attr("stroke-opacity", 0.6)
            .attr("stroke-width", 2);

        // Create nodes
        const node = g.append("g")
            .selectAll("g")
            .data(mockData.nodes)
            .join("g")
            .call(d3.drag<any, any>()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended));

        // Add circles to nodes with pointer cursor
        node.append("circle")
            .attr("r", 30)
            .attr("fill", (d: any) => d3.schemeCategory10[d.group])
            .style("cursor", "pointer");

        // Add labels to nodes
        node.append("text")
            .text((d: any) => d.id)
            .attr("text-anchor", "middle")
            .attr("dy", ".35em")
            .attr("fill", "white")
            .attr("font-size", "12px")
            .style("cursor", "pointer")
            .style("pointer-events", "none"); // Prevent text from interfering with circle clicks

        // Update positions on simulation tick
        simulation.on("tick", () => {
            link
                .attr("x1", (d: any) => d.source.x)
                .attr("y1", (d: any) => d.source.y)
                .attr("x2", (d: any) => d.target.x)
                .attr("y2", (d: any) => d.target.y);

            node
                .attr("transform", (d: any) => `translate(${d.x},${d.y})`);
        });

        // Drag functions
        function dragstarted(event: any) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            event.subject.fx = event.subject.x;
            event.subject.fy = event.subject.y;
        }

        function dragged(event: any) {
            event.subject.fx = event.x;
            event.subject.fy = event.y;
        }

        function dragended(event: any) {
            if (!event.active) simulation.alphaTarget(0);
            event.subject.fx = null;
            event.subject.fy = null;
        }

        // Handle window resize
        const resizeObserver = new ResizeObserver(() => {
            width = svgContainer.clientWidth;
            height = svgContainer.clientHeight;
            simulation.force("center", d3.forceCenter(width / 2, height / 2));
            simulation.alpha(0.3).restart();
        });

        resizeObserver.observe(svgContainer);

        // Add click handler to close sidebar when clicking canvas
        svg.on("click", () => {
            if (currentTool === 'pan') {
                sheetOpen = false;
                selectedNode = null;
            }
        });

        // Add click handler to the node group
        node.on("click", (event: MouseEvent, d: any) => {
            event.stopPropagation();
            event.preventDefault();
            console.log('Node clicked in D3:', d);  // Debug log
            handleNodeClick(d);
        });

        document.addEventListener('click', handleClickOutside);
        return () => {
            resizeObserver.disconnect();
            document.removeEventListener('click', handleClickOutside);
        };
    });

    // Export functionality
    const exportGraph = () => {
        const svgData = svgContainer.innerHTML;
        const blob = new Blob([svgData], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'knowledge-graph.svg';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    // Handle node selection
    function handleNodeClick(node: any) {
        console.log('Node clicked:', node);
        selectedNode = { ...node };
        sheetOpen = true;
    }

    // Add new node
    function addNode(type: string) {
        const id = `New ${type} ${mockData.nodes.length + 1}`;
        const newNode = {
            id,
            group: nodeTypes.findIndex(t => t.id === type) + 1,
            type,
            properties: {
                description: '',
                attributes: []
            }
        };
        mockData.nodes.push(newNode);
        // Restart simulation...
    }

    // Filter panel state
    let filterDropdownOpen = false;
    let relationshipDropdownOpen = false;
    let searchDropdownOpen = false;

    // Filter states
    let nodeTypeFilters = nodeTypes.map(type => ({ ...type, checked: true }));
    let relationshipFilters = {
        direct: true,
        indirect: true
    };
    let searchQuery = '';

    // Filter handlers
    function handleNodeTypeFilter(typeId: string, checked: boolean) {
        nodeTypeFilters = nodeTypeFilters.map(t => 
            t.id === typeId ? { ...t, checked } : t
        );
        // Add actual filtering logic here
    }

    function handleRelationshipFilter(type: 'direct' | 'indirect', checked: boolean) {
        relationshipFilters[type] = checked;
        // Add actual filtering logic here
    }

    function handleSearch(query: string) {
        searchQuery = query;
        // Add actual search logic here
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

    :global(svg) {
        background: transparent;
    }
</style>

<div class="flex flex-col h-full p-4">
    <!-- Header with title and controls -->
    <div class="flex items-center justify-between gap-4 mb-4">
        <h1 class="font-orbitron text-2xl font-semibold tracking-wide">
            Knowledge Graph
        </h1>
        
        <div class="flex items-center gap-2">
            <!-- Graph Tools -->
            <div class="flex items-center gap-1 bg-secondary rounded-lg p-1">
                <Tooltip.Root>
                    <Tooltip.Trigger asChild>
                        <Button 
                            variant={currentTool === 'pan' ? 'default' : 'ghost'} 
                            size="icon"
                            onclick={() => currentTool = 'pan'}
                        >
                            <Hand class="h-4 w-4" />
                        </Button>
                    </Tooltip.Trigger>
                    <Tooltip.Content>
                        <p>Pan Tool</p>
                    </Tooltip.Content>
                </Tooltip.Root>

                <Tooltip.Root>
                    <Tooltip.Trigger asChild>
                        <Button 
                            variant={currentTool === 'select' ? 'default' : 'ghost'} 
                            size="icon"
                            onclick={() => currentTool = 'select'}
                        >
                            <Circle class="h-4 w-4" />
                        </Button>
                    </Tooltip.Trigger>
                    <Tooltip.Content>
                        <p>Select Tool</p>
                    </Tooltip.Content>
                </Tooltip.Root>

                <Tooltip.Root>
                    <Tooltip.Trigger asChild>
                        <Button 
                            variant={currentTool === 'node' ? 'default' : 'ghost'} 
                            size="icon"
                            onclick={() => currentTool = 'node'}
                        >
                            <Plus class="h-4 w-4" />
                        </Button>
                    </Tooltip.Trigger>
                    <Tooltip.Content>
                        <p>Add Node</p>
                    </Tooltip.Content>
                </Tooltip.Root>

                <Tooltip.Root>
                    <Tooltip.Trigger asChild>
                        <Button 
                            variant={currentTool === 'edge' ? 'default' : 'ghost'} 
                            size="icon"
                            onclick={() => currentTool = 'edge'}
                        >
                            <MinusIcon class="h-4 w-4" />
                        </Button>
                    </Tooltip.Trigger>
                    <Tooltip.Content>
                        <p>Add Edge</p>
                    </Tooltip.Content>
                </Tooltip.Root>
            </div>

            <Separator orientation="vertical" class="h-8" />

            <!-- Zoom Controls -->
            <div class="flex items-center gap-1 bg-secondary rounded-lg p-1">
                <Tooltip.Root>
                    <Tooltip.Trigger asChild>
                        <Button variant="ghost" size="icon" onclick={zoomOut}>
                            <ZoomOut class="h-4 w-4" />
                        </Button>
                    </Tooltip.Trigger>
                    <Tooltip.Content>
                        <p>Zoom Out</p>
                    </Tooltip.Content>
                </Tooltip.Root>

                <span class="w-12 text-center text-sm">{zoomLevel}%</span>

                <Tooltip.Root>
                    <Tooltip.Trigger asChild>
                        <Button variant="ghost" size="icon" onclick={zoomIn}>
                            <ZoomIn class="h-4 w-4" />
                        </Button>
                    </Tooltip.Trigger>
                    <Tooltip.Content>
                        <p>Zoom In</p>
                    </Tooltip.Content>
                </Tooltip.Root>

                <Tooltip.Root>
                    <Tooltip.Trigger asChild>
                        <Button variant="ghost" size="icon" onclick={resetZoom}>
                            <Focus class="h-4 w-4" />
                        </Button>
                    </Tooltip.Trigger>
                    <Tooltip.Content>
                        <p>Reset Zoom</p>
                    </Tooltip.Content>
                </Tooltip.Root>
            </div>
            
            <Separator orientation="vertical" class="h-8" />
            
            <!-- Create Button -->
            <Button variant="default" class="gap-2">
                <Plus class="h-4 w-4" />
                Create
            </Button>
        </div>
    </div>

    <div class="flex flex-1 gap-4 relative">
        <!-- Left Filter Panel -->
        <div 
            class="sidebar-container relative"
            style:width="{sidebarWidth}px"
        >
            <ScrollArea.Root class="h-full">
                <div class="p-2">
                    {#if !isCollapsed}
                        <div class="mb-4">
                            <h3 class="font-semibold">Filters</h3>
                        </div>

                        <div class="space-y-6">
                            <!-- Node Types -->
                            <div class="space-y-2">
                                <label class="text-sm font-medium">Node Types</label>
                                {#each nodeTypeFilters as type}
                                    <label class="flex items-center gap-2">
                                        <input 
                                            type="checkbox" 
                                            checked={type.checked}
                                            class="rounded" 
                                            onchange={(e) => handleNodeTypeFilter(type.id, e.target.checked)}
                                        />
                                        <span class="text-sm">{type.name}</span>
                                    </label>
                                {/each}
                            </div>

                            <!-- Relationships -->
                            <div class="space-y-2">
                                <label class="text-sm font-medium">Relationships</label>
                                <label class="flex items-center gap-2">
                                    <input 
                                        type="checkbox" 
                                        checked={relationshipFilters.direct}
                                        class="rounded" 
                                        onchange={(e) => handleRelationshipFilter('direct', e.target.checked)}
                                    />
                                    <span class="text-sm">Direct Connections</span>
                                </label>
                                <label class="flex items-center gap-2">
                                    <input 
                                        type="checkbox" 
                                        checked={relationshipFilters.indirect}
                                        class="rounded" 
                                        onchange={(e) => handleRelationshipFilter('indirect', e.target.checked)}
                                    />
                                    <span class="text-sm">Indirect Connections</span>
                                </label>
                            </div>

                            <!-- Search -->
                            <div class="space-y-2">
                                <label class="text-sm font-medium">Search</label>
                                <input 
                                    type="text" 
                                    value={searchQuery}
                                    placeholder="Search nodes..." 
                                    class="w-full p-2 rounded-md bg-secondary/20" 
                                    onchange={(e) => handleSearch(e.target.value)}
                                />
                            </div>
                        </div>
                    {:else}
                        <div class="flex flex-col items-center gap-2">
                            <!-- Node Types Filter -->
                            <div class="relative">
                                <Tooltip.Root>
                                    <Tooltip.Trigger asChild>
                                        <Button 
                                            variant="ghost" 
                                            size="icon"
                                            class="w-8 h-8 p-0"
                                            onclick={() => toggleDropdown('filter')}
                                        >
                                            <Filter class="h-4 w-4" />
                                        </Button>
                                    </Tooltip.Trigger>
                                    <Tooltip.Content side="right">
                                        <p>Filter by type</p>
                                    </Tooltip.Content>
                                </Tooltip.Root>
                            </div>

                            <!-- Relationships Filter -->
                            <div class="relative">
                                <Tooltip.Root>
                                    <Tooltip.Trigger asChild>
                                        <Button 
                                            variant="ghost" 
                                            size="icon"
                                            class="w-8 h-8 p-0"
                                            onclick={() => toggleDropdown('relationship')}
                                        >
                                            <Network class="h-4 w-4" />
                                        </Button>
                                    </Tooltip.Trigger>
                                    <Tooltip.Content side="right">
                                        <p>Filter relationships</p>
                                    </Tooltip.Content>
                                </Tooltip.Root>
                            </div>

                            <!-- Search -->
                            <div class="relative">
                                <Tooltip.Root>
                                    <Tooltip.Trigger asChild>
                                        <Button 
                                            variant="ghost" 
                                            size="icon"
                                            class="w-8 h-8 p-0"
                                            onclick={() => toggleDropdown('search')}
                                        >
                                            <Search class="h-4 w-4" />
                                        </Button>
                                    </Tooltip.Trigger>
                                    <Tooltip.Content side="right">
                                        <p>Search nodes</p>
                                    </Tooltip.Content>
                                </Tooltip.Root>
                            </div>
                        </div>
                    {/if}
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

        <!-- Main canvas area -->
        <div 
            bind:this={svgContainer}
            class="flex-1 bg-secondary/20 rounded-lg border relative overflow-hidden"
        />

        <!-- Right sidebar -->
        <Sheet.Root bind:open={sheetOpen} onOpenChange={(open) => { if (!open) selectedNode = null; }}>
            {#if selectedNode}
                <Sheet.Content class="w-[400px]">
                    <Sheet.Header>
                        <Sheet.Title>Node Properties</Sheet.Title>
                        <Sheet.Description>
                            Edit the properties of the selected node
                        </Sheet.Description>
                    </Sheet.Header>

                    <Tabs defaultValue="properties" class="mt-6">
                        <TabsList class="w-full">
                            <TabsTrigger value="properties">Properties</TabsTrigger>
                            <TabsTrigger value="styling">Styling</TabsTrigger>
                        </TabsList>
                        <TabsContent value="properties">
                            <div class="space-y-4">
                                <div>
                                    <label class="text-sm font-medium">ID</label>
                                    <input 
                                        type="text" 
                                        class="w-full p-2 rounded-md bg-secondary/20" 
                                        value={selectedNode.id}
                                    />
                                </div>
                                <div>
                                    <label class="text-sm font-medium">Type</label>
                                    <select 
                                        class="w-full p-2 rounded-md bg-secondary/20"
                                        value={selectedNode.type}
                                    >
                                        {#each nodeTypes as type}
                                            <option value={type.id}>{type.name}</option>
                                        {/each}
                                    </select>
                                </div>
                                <div>
                                    <label class="text-sm font-medium">Description</label>
                                    <textarea 
                                        class="w-full p-2 rounded-md bg-secondary/20" 
                                        rows="3"
                                        value={selectedNode.properties?.description ?? ''}
                                    />
                                </div>
                            </div>
                        </TabsContent>
                        <TabsContent value="styling">
                            <div class="space-y-4">
                                <div>
                                    <label class="text-sm font-medium">Color</label>
                                    <input 
                                        type="color" 
                                        class="w-full"
                                        value={nodeTypes.find(t => t.id === selectedNode.type)?.color ?? '#000000'}
                                    />
                                </div>
                                <div>
                                    <label class="text-sm font-medium">Size</label>
                                    <input 
                                        type="range" 
                                        min="20" 
                                        max="60" 
                                        class="w-full"
                                        value="30"
                                    />
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>

                    <Sheet.Footer class="mt-6">
                        <Button variant="outline" on:click={() => sheetOpen = false}>
                            Cancel
                        </Button>
                        <Button>Save changes</Button>
                    </Sheet.Footer>
                </Sheet.Content>
            {/if}
        </Sheet.Root>
    </div>
</div>

{#if browser}
    <div class="dropdown-portal fixed inset-0 pointer-events-none">
        <div class="relative h-full">
            <!-- Filter Types Dropdown Portal -->
            {#if activeDropdown === 'filter'}
                <div 
                    class="absolute pointer-events-auto"
                    style="left: {sidebarWidth + 8}px; top: 80px;"
                >
                    <div class="bg-popover rounded-md border shadow-md w-56 p-2">
                        <div class="font-medium mb-2">Node Types</div>
                        {#each nodeTypeFilters as type}
                            <label class="flex items-center gap-2 p-1 hover:bg-muted rounded">
                                <input 
                                    type="checkbox" 
                                    checked={type.checked}
                                    class="rounded" 
                                    onchange={(e) => handleNodeTypeFilter(type.id, e.target.checked)}
                                />
                                <span class="text-sm">{type.name}</span>
                            </label>
                        {/each}
                    </div>
                </div>
            {/if}

            <!-- Relationships Dropdown Portal -->
            {#if activeDropdown === 'relationship'}
                <div 
                    class="absolute pointer-events-auto"
                    style="left: {sidebarWidth + 8}px; top: 120px;"
                >
                    <div class="bg-popover rounded-md border shadow-md w-56 p-2">
                        <div class="font-medium mb-2">Relationships</div>
                        <label class="flex items-center gap-2 p-1 hover:bg-muted rounded">
                            <input 
                                type="checkbox" 
                                checked={relationshipFilters.direct}
                                class="rounded" 
                                onchange={(e) => handleRelationshipFilter('direct', e.target.checked)}
                            />
                            <span class="text-sm">Direct Connections</span>
                        </label>
                        <label class="flex items-center gap-2 p-1 hover:bg-muted rounded">
                            <input 
                                type="checkbox" 
                                checked={relationshipFilters.indirect}
                                class="rounded" 
                                onchange={(e) => handleRelationshipFilter('indirect', e.target.checked)}
                            />
                            <span class="text-sm">Indirect Connections</span>
                        </label>
                    </div>
                </div>
            {/if}

            <!-- Search Dropdown Portal -->
            {#if activeDropdown === 'search'}
                <div 
                    class="absolute pointer-events-auto"
                    style="left: {sidebarWidth + 8}px; top: 160px;"
                >
                    <div class="bg-popover rounded-md border shadow-md w-56 p-2">
                        <input 
                            type="text" 
                            value={searchQuery}
                            placeholder="Search nodes..." 
                            class="w-full p-2 rounded-md bg-secondary/20"
                            onchange={(e) => handleSearch(e.target.value)}
                        />
                    </div>
                </div>
            {/if}
        </div>
    </div>
{/if} 