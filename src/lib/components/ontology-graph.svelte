<script lang="ts">
    import { onMount } from 'svelte';
    import * as d3 from 'd3';

    export let data: any;
    let svg: SVGElement;

    onMount(() => {
        const width = svg.clientWidth;
        const height = svg.clientHeight;
        
        const margin = { top: 60, right: 120, bottom: 60, left: 120 };
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

        const treeLayout = d3.tree()
            .size([innerWidth, innerHeight])
            .nodeSize([250, 150])  // Increased spacing
            .separation((a, b) => {
                return a.parent === b.parent ? 2 : 3;
            });

        // Improved data processing to show complete structure
        function processData(data: any) {
            // Root node
            const root = {
                name: "root",
                children: [{
                    name: "ontology",
                    children: [
                        // Name and description node
                        {
                            name: "metadata",
                            children: [
                                { 
                                    name: "name",
                                    value: data.ontology.name
                                },
                                {
                                    name: "description",
                                    value: data.ontology.description
                                }
                            ]
                        },
                        // Superclasses node
                        {
                            name: "superclasses",
                            children: data.ontology.superclasses.map(superclass => ({
                                name: superclass.name,
                                description: superclass.description,
                                children: [
                                    // Attributes if they exist
                                    superclass.attributes && {
                                        name: "attributes",
                                        children: superclass.attributes.map(attr => ({
                                            name: `${attr.name}: ${attr.type}`,
                                            description: attr.description
                                        }))
                                    },
                                    // Subclasses if they exist
                                    superclass.subclasses && {
                                        name: "subclasses",
                                        children: superclass.subclasses.map(sub => ({
                                            name: sub.name,
                                            children: [
                                                // Subclass attributes
                                                {
                                                    name: "attributes",
                                                    children: sub.attributes?.map(attr => ({
                                                        name: `${attr.name}: ${attr.type}`
                                                    }))
                                                },
                                                // Subclass relationships
                                                {
                                                    name: "relationships",
                                                    children: sub.relationships?.map(rel => ({
                                                        name: `${rel.name} → ${rel.target}`
                                                    }))
                                                }
                                            ]
                                        }))
                                    }
                                ].filter(Boolean)  // Remove undefined items
                            }))
                        },
                        // Rules node
                        {
                            name: "rules",
                            children: data.ontology.rules.map((rule, index) => ({
                                name: `Rule ${index + 1}`,
                                value: rule
                            }))
                        }
                    ]
                }]
            };

            return root;
        }

        // Rest of the visualization code remains similar, but update node styling
        const hierarchyData = processData(data);
        const root = d3.hierarchy(hierarchyData);

        // Apply the tree layout
        treeLayout(root);

        // Create SVG elements
        const svgEl = d3.select(svg);
        svgEl.selectAll("*").remove();
        
        const g = svgEl.append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // Create links
        const links = g.selectAll(".link")
            .data(root.links())
            .enter()
            .append("path")
            .attr("class", "link")
            .attr("d", d3.linkVertical()
                .x(d => d.x)
                .y(d => d.y)
            );

        // Create nodes
        const nodes = g.selectAll(".node")
            .data(root.descendants())
            .enter()
            .append("g")
            .attr("class", d => {
                const depth = d.depth;
                const hasChildren = d.children ? "node--internal" : "node--leaf";
                return `node node--depth-${depth} ${hasChildren}`;
            })
            .attr("transform", d => `translate(${d.x},${d.y})`);

        // Add node backgrounds
        nodes.append("rect")
            .attr("class", "node-bg")
            .attr("x", -120)
            .attr("y", -25)
            .attr("width", 240)
            .attr("height", 50)
            .attr("rx", 8)
            .attr("ry", 8);

        // Add node labels
        nodes.append("text")
            .attr("class", "node-label")
            .attr("dy", "0.32em")
            .attr("text-anchor", "middle")
            .text(d => {
                if (d.data.value) {
                    return `${d.data.name}: ${d.data.value}`;
                }
                return d.data.name;
            });

        // Add descriptions on hover
        nodes.append("title")
            .text(d => d.data.description || d.data.value || "");

        // Enhanced zoom behavior
        const zoom = d3.zoom()
            .scaleExtent([0.2, 2])
            .on("zoom", (event) => {
                g.attr("transform", event.transform);
            });

        svgEl.call(zoom);

        // Initial zoom to fit
        const bounds = g.node().getBBox();
        const scale = Math.min(
            innerWidth / bounds.width,
            innerHeight / bounds.height,
            0.4  // Smaller scale to show more of the structure
        );
        
        svgEl.transition().duration(750).call(
            zoom.transform,
            d3.zoomIdentity
                .translate(
                    (width - bounds.width * scale) / 2 - bounds.x * scale,
                    margin.top
                )
                .scale(scale)
        );
    });
</script>

<svg 
    bind:this={svg} 
    class="w-full h-full"
    viewBox="0 0 1200 900"
    preserveAspectRatio="xMidYMid meet"
>
</svg>

<style>
    svg {
        user-select: none;
    }
    :global(.node-label) {
        font-size: 14px;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
        fill: hsl(var(--background));  /* Light text on dark boxes */
    }
    :global(.link) {
        fill: none;
        stroke: hsl(var(--foreground)/0.5);  /* Darker lines */
        stroke-width: 3px;
        stroke-opacity: 0.8;
    }
    :global(.node-bg) {
        fill: hsl(var(--foreground)/0.9);  /* Dark boxes */
        stroke: hsl(var(--foreground));     /* Dark borders */
        stroke-width: 2px;
        opacity: 0.9;
        transition: all 0.2s;
    }
    :global(.node--depth-0 > .node-bg) {
        fill: hsl(var(--foreground));
        opacity: 0.95;
    }
    :global(.node--depth-1 > .node-bg) {
        fill: hsl(var(--foreground)/0.85);
    }
    :global(.node--depth-2 > .node-bg) {
        fill: hsl(var(--foreground)/0.8);
    }
    :global(.node--depth-3 > .node-bg) {
        fill: hsl(var(--foreground)/0.75);
    }
    :global(.node:hover .node-bg) {
        opacity: 1;
        filter: drop-shadow(0 4px 3px rgb(0 0 0 / 0.2)) 
                drop-shadow(0 2px 2px rgb(0 0 0 / 0.15));
        transform: translateY(-1px);
    }
    :global(.node--internal .node-label) {
        font-weight: bold;
    }
</style> 