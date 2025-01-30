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
    import Maximize2 from "lucide-svelte/icons/maximize-2";
    import Minimize2 from "lucide-svelte/icons/minimize-2";
    import * as Table from "$lib/components/ui/table";
    import { Badge } from "$lib/components/ui/badge";
    import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "$lib/components/ui/accordion";

    // Restore tool state type
    let currentTool: 'pan' | 'node' | 'edge' | 'select' = 'pan';
    let sheetOpen = false;
    let selectedNode: any = null;
    
    // Replace nodeTypes definition
    const nodeTypes = [
        { id: 'class', name: 'Ontology', color: '#333333', radius: 25 },
        { id: 'superclass', name: 'Superclass', color: '#4CAF50', radius: 20 },
        { id: 'subclass', name: 'Subclass', color: '#81C784', radius: 16 },
        { id: 'attribute', name: 'Attribute', color: '#2196F3', radius: 10 }
    ];

    // Import ontology data
    import ontologyData from '../ontology/ontology.json';

    // Transform ontology data into graph nodes/links
    let ontologyGraph = {
        nodes: [],
        links: []
    };

    // Create root node
    const rootNode = {
        id: ontologyData.ontology.name,
        type: 'class',
        properties: {
            description: ontologyData.ontology.description
        }
    };
    ontologyGraph.nodes.push(rootNode);

    // Process superclasses and subclasses
    ontologyData.ontology.superclasses.forEach(superclass => {
        const superNode = {
            id: superclass.name,
            type: 'superclass',
            properties: {
                description: superclass.description
            }
        };
        ontologyGraph.nodes.push(superNode);
        ontologyGraph.links.push({
            source: rootNode.id,
            target: superNode.id,
            type: 'is_a'
        });

        // Process subclasses
        superclass.subclasses?.forEach(subclass => {
            const subNode = {
                id: subclass.name,
                type: 'subclass',
                properties: {
                    description: subclass.description,
                    attributes: subclass.attributes
                }
            };
            ontologyGraph.nodes.push(subNode);
            ontologyGraph.links.push({
                source: superNode.id,
                target: subNode.id,
                type: 'has_subclass'
            });

            // Process attributes
            subclass.attributes?.forEach(attr => {
                const attrNode = {
                    id: `${subNode.id}.${attr.name}`,
                    type: 'attribute',
                    properties: {
                        ...attr
                    }
                };
                ontologyGraph.nodes.push(attrNode);
                ontologyGraph.links.push({
                    source: subNode.id,
                    target: attrNode.id,
                    type: 'has_attribute'
                });
            });
        });
    });

    let svgContainer: HTMLDivElement;
    let svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
    let g: d3.Selection<SVGGElement, unknown, null, undefined>;
    let zoomLevel = 100;
    let width: number;
    let height: number;
    let resizeObserver: ResizeObserver;

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
    const EXPANDED_WIDTH = 320;
    const COLLAPSED_WIDTH = 48;
    let isCollapsed = true;
    let sidebarWidth = EXPANDED_WIDTH;

    // Add toggle function
    function toggleSidebar() {
        isCollapsed = !isCollapsed;
        sidebarWidth = isCollapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH;
    }

    // Add responsive initialization on mount
    onMount(() => {
        // Initialize after DOM is ready
        requestAnimationFrame(() => {
            // Initialize SVG
            width = svgContainer.clientWidth;
            height = svgContainer.clientHeight;

            svg = d3.select(svgContainer)
                .append("svg")
                .attr("width", "100%")
                .attr("height", "100%")
                .call(zoom);

            g = svg.append("g");

            // Update the force simulation configuration
            const simulation = d3.forceSimulation(ontologyGraph.nodes as any)
                .force("link", d3.forceLink()
                    .id((d: any) => d.id)
                    .links(ontologyGraph.links)
                    .distance(d => {
                        if (d.type === 'is_a') return 150;
                        if (d.type === 'has_subclass') return 100;
                        if (d.type === 'has_attribute') return 50;
                        return 80;
                    })
                )
                .force("charge", d3.forceManyBody().strength(-500))
                .force("collision", d3.forceCollide().radius(d => {
                    if (d.type === 'class') return 30;
                    if (d.type === 'superclass') return 25;
                    if (d.type === 'subclass') return 20;
                    return 10;
                }))
                .force("x", d3.forceX().strength(0.1))
                .force("y", d3.forceY().strength(0.2));

            // Only fix the Classes node
            ontologyGraph.nodes.forEach((node: any) => {
                if (node.id === "Classes") {
                    node.fx = width / 2;
                    node.fy = 50;
                } else {
                    node.fx = null;
                    node.fy = null;
                }
            });

            // Create links
            const link = g.append("g")
                .selectAll("line")
                .data(ontologyGraph.links)
                .join("line")
                .attr("stroke", "#999")
                .attr("stroke-opacity", 0.6)
                .attr("stroke-width", 2);

            // Create nodes
            const nodeGroup = g.append("g")
                .selectAll("g")
                .data(ontologyGraph.nodes)
                .join("g")
                .call(d3.drag<any, any>()
                    .on("start", dragstarted)
                    .on("drag", dragged)
                    .on("end", dragended));

            // Add circles to nodes with pointer cursor
            nodeGroup.append("circle")
                .attr("r", (d: any) => nodeTypes.find(t => t.id === d.type)?.radius || 8)
                .attr("fill", (d: any) => nodeTypes.find(t => t.id === d.type)?.color || '#999')
                .style("cursor", "pointer")
                .style("stroke", d => hoveredNode?.id === d.id ? "#fff" : "none")
                .style("stroke-width", 2)
                .on('mouseover', (event, d) => {
                    selectedNode = d;
                })
                .on('mouseout', () => {
                    selectedNode = null;
                });

            // Add labels NEXT TO nodes with hover effect
            nodeGroup.append("text")
                .text((d: any) => d.id)
                .attr("x", (d: any) => (nodeTypes.find(t => t.id === d.type)?.radius || 8) + 5)
                .attr("y", 5)
                .attr("text-anchor", "start")
                .attr("fill", "currentColor")
                .attr("font-size", "12px")
                .style("cursor", "pointer")
                .on('mouseover', (event, d) => {
                    selectedNode = d;
                })
                .on('mouseout', () => {
                    selectedNode = null;
                });

            // Update positions on simulation tick
            simulation.on("tick", () => {
                link
                    .attr("x1", (d: any) => d.source.x)
                    .attr("y1", (d: any) => d.source.y)
                    .attr("x2", (d: any) => d.target.x)
                    .attr("y2", (d: any) => d.target.y);

                nodeGroup
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
                // Don't reset fx and fy to null - this keeps nodes where we drag them
                // Only reset if it's not the Classes node (which should stay at the top)
                if (event.subject.id !== "Classes") {
                    // Keep the fixed position where we dropped it
                    event.subject.fx = event.x;
                    event.subject.fy = event.y;
                }
            }

            // Handle window resize
            resizeObserver = new ResizeObserver(() => {
                if (!svgContainer) return;
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
            nodeGroup.on("click", (event: MouseEvent, d: any) => {
                event.stopPropagation();
                event.preventDefault();
                console.log('Node clicked in D3:', d);  // Debug log
                handleNodeClick(d);
            });

            document.addEventListener('click', handleClickOutside);

            // Listen for fullscreen changes
            document.addEventListener('fullscreenchange', () => {
                isFullscreen = !!document.fullscreenElement;
            });

            // Add this in the nodeGroup section
            nodeGroup.on("mouseover", (event, d) => {
                if (d.type === 'subclass') {
                    hoveredNode = d;
                }
            }).on("mouseout", () => {
                hoveredNode = null;
            });
        });

        return () => {
            if (resizeObserver) {
                resizeObserver.disconnect();
            }
            document.removeEventListener('click', handleClickOutside);
            document.removeEventListener('fullscreenchange', () => {
                isFullscreen = !!document.fullscreenElement;
            });
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

    // First, add state for tracking active tab
    let activeTab = 'filters';  // Set default tab to 'filters'

    function handleTabChange(tab: string) {
        activeTab = tab;
    }

    // Add fullscreen state
    let isFullscreen = false;

    // Add fullscreen toggle function
    async function toggleFullscreen() {
        if (!document.fullscreenElement) {
            // Get the container with the background
            const whiteboardContainer = document.querySelector('.whiteboard-container');
            await whiteboardContainer?.requestFullscreen();
            isFullscreen = true;
        } else {
            await document.exitFullscreen();
            isFullscreen = false;
        }
    }

    let hoveredNode: any = null;

    // Add click outside handler
    function handleClickOutside(event: MouseEvent) {
        const target = event.target as HTMLElement;
        if (!target.closest('.sidebar-container') && !target.closest('.dropdown-portal')) {
            closeDropdowns();
        }
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

    // Restore addNode function
    function addNode(type: string) {
        const id = `New ${type} ${ontologyGraph.nodes.length + 1}`;
        const newNode = {
            id,
            type,
            properties: {
                description: '',
                attributes: []
            }
        };
        ontologyGraph.nodes.push(newNode);
        // Restart simulation...
    }
</script>

<style lang="postcss">
    .sidebar-container {
        border-right: 1px solid hsl(var(--border) / 0.3);
        background-color: hsl(var(--background));
        transition: width 150ms cubic-bezier(0.4, 0, 0.2, 1);
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

    /* Fullscreen styles */
    :global(.whiteboard-container:fullscreen) {
        padding: 1rem;
        background-color: hsl(var(--background));
    }

    :global(.whiteboard-container:fullscreen .graph-area) {
        background-color: hsl(var(--secondary) / 0.2);
        border: 1px solid hsl(var(--border));
        border-radius: 0.5rem;
        height: 100%;
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
        
        <div class="flex items-center gap-4 p-4">
            <!-- Update the filter dropdown structure -->
            <div class="flex items-center gap-2">
                <DropdownMenu.Root>
                    <DropdownMenu.Trigger asChild>
                        <Tooltip.Root>
                            <Tooltip.Trigger asChild>
                                <Button variant="ghost" size="icon">
                                    <Filter class="h-4 w-4" />
                                </Button>
                            </Tooltip.Trigger>
                            <Tooltip.Content>
                                <p>Filter Node Types</p>
                            </Tooltip.Content>
                        </Tooltip.Root>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Content>
                        <DropdownMenu.Label>Node Types</DropdownMenu.Label>
                        <DropdownMenu.Separator />
                        {#each nodeTypeFilters as type}
                            <DropdownMenu.CheckboxItem 
                                checked={type.checked}
                                onCheckedChange={(checked) => handleNodeTypeFilter(type.id, checked)}
                            >
                                {type.name}
                            </DropdownMenu.CheckboxItem>
                        {/each}
                    </DropdownMenu.Content>
                </DropdownMenu.Root>

                <DropdownMenu.Root>
                    <DropdownMenu.Trigger asChild>
                        <Tooltip.Root>
                            <Tooltip.Trigger asChild>
                                <Button variant="ghost" size="icon">
                                    <Network class="h-4 w-4" />
                                </Button>
                            </Tooltip.Trigger>
                            <Tooltip.Content>
                                <p>Filter Relationships</p>
                            </Tooltip.Content>
                        </Tooltip.Root>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Content>
                        <DropdownMenu.Label>Relationships</DropdownMenu.Label>
                        <DropdownMenu.Separator />
                        <DropdownMenu.CheckboxItem 
                            checked={relationshipFilters.direct}
                            onCheckedChange={(checked) => handleRelationshipFilter('direct', checked)}
                        >
                            Direct Connections
                        </DropdownMenu.CheckboxItem>
                        <DropdownMenu.CheckboxItem 
                            checked={relationshipFilters.indirect}
                            onCheckedChange={(checked) => handleRelationshipFilter('indirect', checked)}
                        >
                            Indirect Connections
                        </DropdownMenu.CheckboxItem>
                    </DropdownMenu.Content>
                </DropdownMenu.Root>
            </div>

            <Separator orientation="vertical" class="h-8" />

            <!-- Search Input -->
            <div class="relative flex-1 max-w-[300px]">
                <div class="flex items-center h-9 w-full rounded-md border bg-background">
                    <Search class="h-4 w-4 ml-3 text-muted-foreground" />
                    <input 
                        type="text" 
                        placeholder="Search nodes..." 
                        class="h-full flex-1 bg-transparent px-3 text-sm outline-none border-none"
                        value={searchQuery}
                        oninput={(e) => handleSearch(e.currentTarget.value)}
                    />
                </div>
            </div>

            <Separator orientation="vertical" class="h-8" />

            <!-- Zoom Controls -->
            <div class="flex items-center gap-2">
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

                <div class="w-[40px] text-center text-sm">
                    {zoomLevel}%
                </div>

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

                <Separator orientation="vertical" class="mx-1 h-6" />

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

                <Separator orientation="vertical" class="mx-1 h-6" />

                <Tooltip.Root>
                    <Tooltip.Trigger asChild>
                        <Button variant="ghost" size="icon" onclick={toggleFullscreen}>
                            {#if isFullscreen}
                                <Minimize2 class="h-4 w-4" />
                            {:else}
                                <Maximize2 class="h-4 w-4" />
                            {/if}
                        </Button>
                    </Tooltip.Trigger>
                    <Tooltip.Content>
                        <p>{isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}</p>
                    </Tooltip.Content>
                </Tooltip.Root>
            </div>
        </div>
    </div>

    <div class="flex flex-1 gap-4 relative">
        <!-- Main canvas area -->
        <div 
            class="whiteboard-container flex-1 relative overflow-hidden"
        >
            <div 
                bind:this={svgContainer} 
                class="graph-area w-full h-full bg-secondary/20 rounded-lg border"
            >
                <!-- SVG will be rendered here -->
            </div>

            <!-- Update the key/legend -->
            <div class="absolute top-4 left-4 p-3 bg-background/80 backdrop-blur-sm rounded-lg border shadow-sm">
                <div class="text-sm font-medium mb-2">Node Types</div>
                <div class="flex flex-col gap-2">
                    {#each nodeTypes as type}
                        {@const count = ontologyGraph.nodes.filter(node => node.type === type.id).length}
                        <div class="flex items-center gap-2">
                            <Badge 
                                variant="outline" 
                                class="flex items-center gap-2 border-2"
                                style="border-color: {type.color}; color: {type.color};"
                            >
                                <div 
                                    class="w-2 h-2 rounded-full" 
                                    style="background-color: {type.color};"
                                ></div>
                                {type.name} ({count})
                            </Badge>
                        </div>
                    {/each}
                </div>
            </div>

            <!-- Update the hover info bar -->
            <div class="absolute bottom-0 left-0 right-0 h-8 bg-secondary/10 border-t flex items-center px-4 text-sm text-muted-foreground">
                {#if hoveredNode}
                    <div class="flex items-center gap-4">
                        <div class="flex items-center gap-2">
                            <div class={`w-2 h-2 rounded-full`} 
                                 style:background-color={nodeTypes.find(t => t.id === hoveredNode.type)?.color}></div>
                            <span class="font-medium">{hoveredNode.type}</span>
                        </div>
                        <span>|</span>
                        <span>{hoveredNode.id}</span>
                        <span>|</span>
                        <span>{hoveredNode.properties?.description || 'No description'}</span>
                        {#if hoveredNode.type === 'subclass'}
                            <span>|</span>
                            <div class="flex gap-2">
                                {#each hoveredNode.properties.attributes as attr}
                                    <Badge variant="outline" class="text-xs">
                                        {attr.name}: {attr.type}
                                    </Badge>
                                {/each}
                            </div>
                        {/if}
                    </div>
                {:else}
                    <div class="flex items-center gap-2">
                        <span class="text-muted-foreground">Hover over a subclass to view attributes</span>
                    </div>
                {/if}
            </div>
        </div>

        <!-- Right sidebar -->
        <Sheet.Root bind:open={sheetOpen} onOpenChange={(open) => { if (!open) selectedNode = null; }}>
            {#if selectedNode}
                <Sheet.Content class="w-[600px]">
                    <Sheet.Header>
                        <Sheet.Title>Node Properties</Sheet.Title>
                        <Sheet.Description>
                            Edit the properties of the selected node
                        </Sheet.Description>
                    </Sheet.Header>

                    <Tabs defaultValue="properties" class="mt-6" onValueChange={handleTabChange}>
                        <TabsList class="w-full">
                            <TabsTrigger value="properties">Properties</TabsTrigger>
                            <TabsTrigger value="styling">Styling</TabsTrigger>
                            <TabsTrigger value="data">Data</TabsTrigger>
                            <TabsTrigger value="metadata">Metadata</TabsTrigger>
                        </TabsList>
                        <TabsContent value="properties">
                            <div class="space-y-4">
                                <div>
                                    <p class="text-sm font-medium">ID</p>
                                    <input 
                                        type="text" 
                                        class="w-full p-2 rounded-md bg-secondary/20" 
                                        value={selectedNode.id}
                                    />
                                </div>
                                <div>
                                    <p class="text-sm font-medium">Type</p>
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
                                    <p class="text-sm font-medium">Description</p>
                                    <textarea 
                                        class="w-full p-2 rounded-md bg-secondary/20" 
                                        rows="3"
                                        value={selectedNode.properties?.description ?? ''}
                                    ></textarea>
                                </div>
                            </div>
                        </TabsContent>
                        <TabsContent value="styling">
                            <div class="space-y-4">
                                <div>
                                    <p class="text-sm font-medium">Color</p>
                                    <input 
                                        type="color" 
                                        class="w-full"
                                        value={nodeTypes.find(t => t.id === selectedNode.type)?.color ?? '#000000'}
                                    />
                                </div>
                                <div>
                                    <p class="text-sm font-medium">Size</p>
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
                        <TabsContent value="data">
                            <div class="space-y-4">
                                <Table.Root>
                                    <Table.Header>
                                        <Table.Row>
                                            <Table.Head>ID</Table.Head>
                                            <Table.Head>Date</Table.Head>
                                            <Table.Head>Amount</Table.Head>
                                            <Table.Head>Status</Table.Head>
                                        </Table.Row>
                                    </Table.Header>
                                    <Table.Body>
                                        {#if selectedNode.type === 'sales'}
                                            {#each mockSalesData as sale}
                                                <Table.Row>
                                                    <Table.Cell>{sale.id}</Table.Cell>
                                                    <Table.Cell>{sale.date}</Table.Cell>
                                                    <Table.Cell>${sale.amount}</Table.Cell>
                                                    <Table.Cell>{sale.status}</Table.Cell>
                                                </Table.Row>
                                            {/each}
                                        {:else}
                                            <Table.Row>
                                                <Table.Cell colspan="4" class="text-center text-muted-foreground">
                                                    No data records available for this node type
                                                </Table.Cell>
                                            </Table.Row>
                                        {/if}
                                    </Table.Body>
                                </Table.Root>
                            </div>
                        </TabsContent>
                        <TabsContent value="metadata">
                            <div class="space-y-4">
                                <!-- Ontology Class Info -->
                                <div>
                                    <p class="text-sm font-medium">Ontology Class</p>
                                    <div class="mt-1 p-3 rounded-md bg-secondary/20">
                                        <div class="flex items-center gap-2">
                                            <div class={`w-2 h-2 rounded-full ${nodeTypes.find(t => t.id === selectedNode.type)?.color ?? 'bg-gray-400'}`}></div>
                                            <span>{nodeTypes.find(t => t.id === selectedNode.type)?.name ?? 'Unknown Type'}</span>
                                        </div>
                                    </div>
                                </div>

                                <!-- Attributes -->
                                <div>
                                    <p class="text-sm font-medium">Attributes</p>
                                    <div class="mt-1 space-y-2">
                                        {#if selectedNode.properties?.attributes?.length}
                                            {#each selectedNode.properties.attributes as attribute}
                                                <div class="flex items-center justify-between p-2 rounded-md bg-secondary/20">
                                                    <span class="text-sm">{attribute}</span>
                                                    <Button variant="ghost" size="sm">
                                                        <Plus class="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            {/each}
                                        {:else}
                                            <div class="text-sm text-muted-foreground p-2">
                                                No attributes defined
                                            </div>
                                        {/if}
                                    </div>
                                </div>

                                <!-- Relationships -->
                                <div>
                                    <p class="text-sm font-medium">Relationships</p>
                                    <div class="mt-1 space-y-2">
                                        {#if ontologyGraph.links.some(link => link.source === selectedNode.id || link.target === selectedNode.id)}
                                            {#each ontologyGraph.links.filter(link => link.source === selectedNode.id || link.target === selectedNode.id) as link}
                                                <div class="flex items-center justify-between p-2 rounded-md bg-secondary/20">
                                                    <div class="flex items-center gap-2">
                                                        <span class="text-sm">
                                                            {link.source === selectedNode.id ? 
                                                                `→ ${link.target}` : 
                                                                `← ${link.source}`}
                                                        </span>
                                                    </div>
                                                    <Button variant="ghost" size="sm">
                                                        <Network class="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            {/each}
                                        {:else}
                                            <div class="text-sm text-muted-foreground p-2">
                                                No relationships defined
                                            </div>
                                        {/if}
                                    </div>
                                </div>

                                <!-- Additional Metadata -->
                                <div>
                                    <p class="text-sm font-medium">Metadata</p>
                                    <div class="mt-1 rounded-md bg-secondary/20 p-2">
                                        <pre class="text-xs overflow-auto">
                                            {JSON.stringify(selectedNode, null, 2)}
                                        </pre>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>

                    <!-- Move the conditional footer inside Sheet.Content -->
                    {#if activeTab === 'properties' || activeTab === 'styling'}
                        <Sheet.Footer class="mt-6">
                            <Button variant="outline" on:click={() => sheetOpen = false}>
                                Cancel
                            </Button>
                            <Button>Save changes</Button>
                        </Sheet.Footer>
                    {/if}
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