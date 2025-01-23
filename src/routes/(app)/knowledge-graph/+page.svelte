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

    // Add tool state
    let currentTool: 'pan' | 'node' | 'edge' | 'select' = 'pan';
    let sheetOpen = false;
    let selectedNode: any = null;
    
    // Update node types to include hierarchy levels
    const nodeTypes = [
        { id: 'root_class', name: 'Root Class', color: '#333333', radius: 20 },    // Root/Thing
        { id: 'main_class', name: 'Main Class', color: '#4CAF50', radius: 15 },    // Core entities
        { id: 'sub_class', name: 'Sub Class', color: '#81C784', radius: 12 },      // Sub-entities
        { id: 'property', name: 'Property', color: '#2196F3', radius: 8 },         // Properties
        { id: 'enum', name: 'Enumeration', color: '#FFC107', radius: 10 }          // Enums/Options
    ];

    // Create a comprehensive B2B SaaS ontology
    const mockData = {
        nodes: [
            // Root Entity
            {
                id: "Thing",
                group: 0,
                type: 'root_class',
                properties: {
                    description: 'Root entity from which all classes inherit',
                    category: 'core'
                }
            },
            // Core Business Entities
            {
                id: "Organization",
                group: 1,
                type: 'main_class',
                properties: {
                    description: 'Business entity using the platform',
                    category: 'core'
                }
            },
            {
                id: "User",  // Add the missing User node
                group: 1,
                type: 'main_class',
                properties: {
                    description: 'User of the platform',
                    category: 'core'
                }
            },
            // Organization Properties
            {
                id: "org_name",
                group: 0,
                type: 'property',
                properties: { dataType: 'string', required: true }
            },
            {
                id: "org_industry",
                group: 0,
                type: 'property',
                properties: { dataType: 'enum', required: true }
            },
            {
                id: "org_size",
                group: 0,
                type: 'enum',
                properties: {
                    values: ['Small', 'Medium', 'Enterprise']
                }
            },

            // Department (Sub-class of Organization)
            {
                id: "Department",
                group: 1,
                type: 'sub_class',
                properties: {
                    description: 'Organizational unit',
                    category: 'organizational'
                }
            },
            // Department Properties
            {
                id: "dept_name",
                group: 1,
                type: 'property',
                properties: { dataType: 'string', required: true }
            },
            {
                id: "dept_budget",
                group: 1,
                type: 'property',
                properties: { dataType: 'number', required: false }
            },

            // Product Hierarchy
            {
                id: "Product",
                group: 2,
                type: 'main_class',
                properties: {
                    description: 'Platform product offering',
                    category: 'product'
                }
            },
            // Product Properties
            {
                id: "product_name",
                group: 2,
                type: 'property',
                properties: { dataType: 'string', required: true }
            },
            {
                id: "product_version",
                group: 2,
                type: 'property',
                properties: { dataType: 'string', required: true }
            },
            {
                id: "product_status",
                group: 2,
                type: 'enum',
                properties: {
                    values: ['Active', 'Beta', 'Deprecated']
                }
            },

            // Feature (Sub-class of Product)
            {
                id: "Feature",
                group: 3,
                type: 'sub_class',
                properties: {
                    description: 'Product feature',
                    category: 'product'
                }
            },
            // Feature Properties
            {
                id: "feature_name",
                group: 3,
                type: 'property',
                properties: { dataType: 'string', required: true }
            },
            {
                id: "feature_status",
                group: 3,
                type: 'enum',
                properties: {
                    values: ['Enabled', 'Disabled', 'Beta']
                }
            },

            // Continue with User, Subscription, etc...
        ],
        links: [
            // Connect all main classes to Thing
            { 
                source: "Organization", 
                target: "Thing", 
                type: 'is_a',
                description: 'Organization is a Thing'
            },
            { 
                source: "Product", 
                target: "Thing", 
                type: 'is_a',
                description: 'Product is a Thing'
            },
            { 
                source: "User", 
                target: "Thing", 
                type: 'is_a',
                description: 'User is a Thing'
            },
            // Organization Hierarchy
            { 
                source: "org_name", 
                target: "Organization", 
                type: 'has_property',
                description: 'Organization name'
            },
            { 
                source: "org_industry", 
                target: "Organization", 
                type: 'has_property',
                description: 'Industry classification'
            },
            { 
                source: "org_size", 
                target: "org_industry", 
                type: 'enum_values',
                description: 'Available size categories'
            },

            // Department Relations
            { 
                source: "Department", 
                target: "Organization", 
                type: 'belongs_to',
                description: 'Department belongs to Organization'
            },
            { 
                source: "dept_name", 
                target: "Department", 
                type: 'has_property',
                description: 'Department name'
            },
            { 
                source: "dept_budget", 
                target: "Department", 
                type: 'has_property',
                description: 'Department budget'
            },

            // Product Hierarchy
            { 
                source: "product_name", 
                target: "Product", 
                type: 'has_property',
                description: 'Product name'
            },
            { 
                source: "product_version", 
                target: "Product", 
                type: 'has_property',
                description: 'Product version'
            },
            { 
                source: "product_status", 
                target: "Product", 
                type: 'has_property',
                description: 'Product status'
            },

            // Feature Relations
            { 
                source: "Feature", 
                target: "Product", 
                type: 'belongs_to',
                description: 'Feature belongs to Product'
            },
            { 
                source: "feature_name", 
                target: "Feature", 
                type: 'has_property',
                description: 'Feature name'
            },
            { 
                source: "feature_status", 
                target: "Feature", 
                type: 'has_property',
                description: 'Feature status'
            }
        ]
    };

    // Add mock data for different node types
    const mockCustomerData = [
        { 
            id: 'Acme Corp',
            industry: 'Technology',
            employees: 500,
            activeUsers: 50,
            mrr: 2500,
            status: 'Active',
            startDate: '2023-01-15'
        },
        // Add more customer examples...
    ];

    const mockUserData = [
        {
            id: 'John Smith',
            email: 'john@acmecorp.com',
            role: 'Admin',
            lastLogin: '2024-03-20',
            department: 'Sales',
            activeModules: ['Analytics', 'Reporting', 'API']
        },
        // Add more user examples...
    ];

    const mockTicketData = [
        {
            id: 'Support #123',
            title: 'API Integration Issue',
            status: 'Open',
            priority: 'High',
            created: '2024-03-19',
            updated: '2024-03-20',
            category: 'Technical'
        },
        // Add more ticket examples...
    ];

    const mockInvoiceData = [
        {
            id: 'INV-2024-001',
            date: '2024-03-01',
            amount: 2500,
            status: 'Paid',
            items: ['Enterprise Plan - Monthly'],
            paymentMethod: 'Credit Card'
        },
        // Add more invoice examples...
    ];

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
        // Check if screen is 2xl or larger
        const mediaQuery = window.matchMedia('(min-width: 1536px)');
        isCollapsed = !mediaQuery.matches;  // Expand on xl screens
        sidebarWidth = isCollapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH;

        // Add listener for screen size changes
        const handleResize = (e: MediaQueryListEvent) => {
            isCollapsed = !e.matches;
            sidebarWidth = isCollapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH;
        };
        mediaQuery.addEventListener('change', handleResize);

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
            const simulation = d3.forceSimulation(mockData.nodes as any)
                .force("link", d3.forceLink()
                    .id((d: any) => d.id)
                    .links(mockData.links.filter(link => 
                        mockData.nodes.some(n => n.id === link.source) && 
                        mockData.nodes.some(n => n.id === link.target)
                    ))
                    .distance(d => {
                        // Longer distances between main classes
                        if (d.source.type === 'main_class' && d.target.type === 'main_class') return 300;
                        // Medium distance for class-to-property connections
                        if (d.type === 'has_property') return 150;
                        // Default distance for other connections
                        return 200;
                    })
                    .strength(0.2)  // Keep links flexible
                )
                .force("charge", d3.forceManyBody()
                    .strength(-600)  // Stronger repulsion
                    .distanceMax(600)  // Longer range
                    .distanceMin(50)   // Minimum spacing
                )
                .force("collision", d3.forceCollide()
                    .radius(d => {
                        // Larger collision radius for main classes
                        if (d.type === 'main_class') return 80;
                        if (d.type === 'sub_class') return 60;
                        return 40;
                    })
                    .strength(0.7)
                )
                // Gentler hierarchical positioning
                .force("y", d3.forceY((d: any) => {
                    if (d.id === "Thing") return 50;
                    if (d.type === "main_class") return height * 0.3;
                    if (d.type === "sub_class") return height * 0.5;
                    if (d.type === "property") return height * 0.7;
                    return height * 0.6;
                }).strength(0.1))
                .force("x", d3.forceX((d: any) => {
                    if (d.id === "Thing") return width / 2;
                    // Spread main classes more widely
                    if (d.type === "main_class") {
                        return width * (0.2 + Math.random() * 0.6);
                    }
                    return width * (0.3 + Math.random() * 0.4);
                }).strength(0.05))
                .alphaDecay(0.005)
                .velocityDecay(0.3);

            // Only fix the Thing node
            mockData.nodes.forEach((node: any) => {
                if (node.id === "Thing") {
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
                .data(mockData.links)
                .join("line")
                .attr("stroke", "#999")
                .attr("stroke-opacity", 0.6)
                .attr("stroke-width", 2);

            // Create nodes
            const nodeGroup = g.append("g")
                .selectAll("g")
                .data(mockData.nodes)
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
                .on('mouseover', (event, d) => {
                    hoveredNode = d;
                })
                .on('mouseout', () => {
                    hoveredNode = null;
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
                    hoveredNode = d;
                })
                .on('mouseout', () => {
                    hoveredNode = null;
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
                // Only reset if it's not the Thing node (which should stay at the top)
                if (event.subject.id !== "Thing") {
                    // Keep the fixed position where we dropped it
                    event.subject.fx = event.x;
                    event.subject.fy = event.y;
                }
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
        });

        return () => {
            resizeObserver.disconnect();
            document.removeEventListener('click', handleClickOutside);
            document.removeEventListener('fullscreenchange', () => {
                isFullscreen = !!document.fullscreenElement;
            });
            mediaQuery.removeEventListener('change', handleResize);
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
            await svgContainer.requestFullscreen();
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
            <!-- Tools Section -->
            <div class="flex items-center gap-2">
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
            class="sidebar-container relative 2xl:w-[320px]"
            style:width="{sidebarWidth}px"
        >
            <ScrollArea.Root class="h-full">
                <div class="p-2">
                    {#if !isCollapsed}
                        <Tabs bind:value={activeTab} defaultValue="filters" class="w-full">
                            <TabsList class="w-full grid grid-cols-2">
                                <TabsTrigger value="filters" class="text-sm">Filters</TabsTrigger>
                                <TabsTrigger value="hierarchy" class="text-sm">Hierarchy</TabsTrigger>
                            </TabsList>

                            <!-- Filters Tab -->
                            <TabsContent value="filters" class="space-y-6">
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
                            </TabsContent>

                            <!-- Hierarchy Tab -->
                            <TabsContent value="hierarchy">
                                <Accordion type="single" collapsible>
                                    <AccordionItem value="root">
                                        <AccordionTrigger>
                                            <div class="flex items-center gap-2">
                                                <div class="w-2 h-2 rounded-full" style="background-color: {nodeTypes[0].color}" />
                                                Thing
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent>
                                            {#each mockData.nodes.filter(n => n.type === 'main_class') as mainClass}
                                                <AccordionItem value={mainClass.id}>
                                                    <AccordionTrigger>
                                                        <div class="flex items-center gap-2">
                                                            <div class="w-2 h-2 rounded-full" style="background-color: {nodeTypes[1].color}" />
                                                            {mainClass.id}
                                                        </div>
                                                    </AccordionTrigger>
                                                    <AccordionContent>
                                                        {#each mockData.nodes.filter(n => n.type === 'sub_class' && mockData.links.some(l => l.source === mainClass.id && l.target === n.id)) as subClass}
                                                            <div class="pl-4 py-2 flex items-center gap-2">
                                                                <div class="w-2 h-2 rounded-full" style="background-color: {nodeTypes[2].color}" />
                                                                {subClass.id}
                                                            </div>
                                                        {/each}
                                                    </AccordionContent>
                                                </AccordionItem>
                                            {/each}
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>
                            </TabsContent>
                        </Tabs>
                    {:else}
                        <!-- Collapsed state content -->
                        <div class="flex flex-col items-center gap-2">
                            {#if activeTab === 'filters'}
                                <!-- Filter Types Button -->
                                <DropdownMenu.Root>
                                    <DropdownMenu.Trigger asChild>
                                        <Button variant="ghost" size="icon" class="w-8 h-8 p-0">
                                            <Filter class="h-3.5 w-3.5" />
                                        </Button>
                                    </DropdownMenu.Trigger>
                                    <DropdownMenu.Content side="right" sideOffset={8}>
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

                                <!-- Relationships Button -->
                                <DropdownMenu.Root>
                                    <DropdownMenu.Trigger asChild>
                                        <Button variant="ghost" size="icon" class="w-8 h-8 p-0">
                                            <Network class="h-4 w-4" />
                                        </Button>
                                    </DropdownMenu.Trigger>
                                    <DropdownMenu.Content side="right" sideOffset={8}>
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
                            {/if}
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
        >
            <!-- Update the key/legend -->
            <div class="absolute top-4 left-4 p-3 bg-background/80 backdrop-blur-sm rounded-lg border shadow-sm">
                <div class="text-sm font-medium mb-2">Node Types</div>
                <div class="flex flex-col gap-2">
                    {#each nodeTypes as type}
                        {@const count = mockData.nodes.filter(node => node.type === type.id).length}
                        <div class="flex items-center gap-2">
                            <Badge 
                                variant="outline" 
                                class="flex items-center gap-2 border-2"
                                style="border-color: {type.color}; color: {type.color};"
                            >
                                <div 
                                    class="w-2 h-2 rounded-full" 
                                    style="background-color: {type.color};"
                                />
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
                            <div class={`w-2 h-2 rounded-full`} style:background-color={nodeTypes.find(t => t.id === hoveredNode.type)?.color} />
                            <span class="font-medium">{hoveredNode.type}</span>
                        </div>
                        <span>|</span>
                        <span>{hoveredNode.id}</span>
                        <span>|</span>
                        <span>{hoveredNode.properties?.description || 'No description'}</span>
                        <span>|</span>
                        <span>Connections: {mockData.links.filter(l => l.source === hoveredNode.id || l.target === hoveredNode.id).length}</span>
                    </div>
                {:else}
                    <div class="flex items-center gap-2">
                        <span class="text-muted-foreground">Status:</span>
                        <span>{mockData.nodes.length} nodes</span>
                        <span>|</span>
                        <span>{mockData.links.length} connections</span>
                        <span>|</span>
                        <span class="text-muted-foreground">Hover over any item to view its details</span>
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
                                    <label class="text-sm font-medium">Ontology Class</label>
                                    <div class="mt-1 p-3 rounded-md bg-secondary/20">
                                        <div class="flex items-center gap-2">
                                            <div class={`w-2 h-2 rounded-full ${nodeTypes.find(t => t.id === selectedNode.type)?.color ?? 'bg-gray-400'}`} />
                                            <span>{nodeTypes.find(t => t.id === selectedNode.type)?.name ?? 'Unknown Type'}</span>
                                        </div>
                                    </div>
                                </div>

                                <!-- Attributes -->
                                <div>
                                    <label class="text-sm font-medium">Attributes</label>
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
                                    <label class="text-sm font-medium">Relationships</label>
                                    <div class="mt-1 space-y-2">
                                        {#if mockData.links.some(link => link.source === selectedNode.id || link.target === selectedNode.id)}
                                            {#each mockData.links.filter(link => link.source === selectedNode.id || link.target === selectedNode.id) as link}
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
                                    <label class="text-sm font-medium">Metadata</label>
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