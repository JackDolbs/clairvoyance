<script lang="ts">
    import { onMount } from 'svelte';
    import * as d3 from 'd3';
    import { scaleOrdinal } from 'd3-scale';
    import { schemeCategory10 } from 'd3-scale-chromatic';

    export let data: any;
    let svg: SVGElement;

    // Color scale for different node types
    const colorScale = scaleOrdinal(schemeCategory10);

    onMount(() => {
        const width = svg.clientWidth;
        const height = svg.clientHeight;
        
        const margin = { top: 40, right: 120, bottom: 40, left: 120 };
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

        // Create a cluster layout with better spacing
        const cluster = d3.cluster()
            .size([innerHeight * 4.5, innerWidth - 200]) // Increased vertical space by 4.5x
            .separation((a: any, b: any) => {
                // Add extra space for attributes
                if (a.data.type === 'attribute' || b.data.type === 'attribute') {
                    return 5;
                }
                // Add extra space for subclasses
                if (a.data.type === 'subclass' || b.data.type === 'subclass') {
                    return 6;
                }
                return a.parent === b.parent ? 4.5 : 6.5;
            });

        // Process data into hierarchical structure
        function processData(data: any) {
            return {
                name: data.ontology.name,
                description: data.ontology.description,
                children: data.ontology.superclasses.map(superclass => ({
                    ...superclass,
                    type: 'superclass',
                    children: [
                        ...(superclass.attributes?.map(attr => ({
                            ...attr,
                            type: 'attribute'
                        })) || []),
                        ...(superclass.subclasses?.map(subclass => ({
                            ...subclass,
                            type: 'subclass',
                            children: [
                                ...(subclass.attributes?.map(attr => ({
                                    ...attr,
                                    type: 'attribute'
                                })) || []),
                                ...(subclass.relationships?.map(rel => ({
                                    ...rel,
                                    type: 'relationship'
                                })) || [])
                            ]
                        })) || [])
                    ]
                }))
            };
        }

        const root = d3.hierarchy(processData(data));
        cluster(root);

        const svgEl = d3.select(svg);
        svgEl.selectAll("*").remove();
        
        const g = svgEl.append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // Add curved links
        const link = g.selectAll(".link")
            .data(root.links())
            .enter().append("path")
            .attr("class", "link")
            .attr("d", d3.linkHorizontal()
                .x(d => d.y)
                .y(d => d.x)
            )
            .style("stroke", "hsl(var(--foreground)/0.2)")
            .style("stroke-width", 1.5)
            .style("stroke-linecap", "round");

        // Create node groups
        const node = g.selectAll(".node")
            .data(root.descendants())
            .enter().append("g")
            .attr("class", d => `node node--${d.data.type}`)
            .attr("transform", d => `translate(${d.y},${d.x})`);

        // Add node circles with different sizes
        node.append("circle")
            .attr("r", (d: any) => {
                if (d.data.type === 'superclass') return 14; // Larger for superclasses
                if (d.data.type === 'subclass') return 11; // Larger for subclasses
                if (d.data.type === 'attribute') return 7;
                return 6;
            })
            .attr("fill", d => colorScale(d.data.type))
            .attr("stroke", "#fff")
            .attr("stroke-width", 2);

        // Add node labels with adjusted positioning
        node.append("text")
            .attr("x", (d: any) => {
                if (d.data.type === 'attribute') return 35; // More offset for attributes
                if (d.data.type === 'subclass') return d.children ? -30 : 30; // More offset for subclasses
                return d.children ? -25 : 25;
            })
            .attr("dy", (d: any) => {
                if (d.data.type === 'attribute') return "0.9em"; // More vertical offset
                if (d.data.type === 'subclass') return "0.8em"; // More vertical offset for subclasses
                return "0.7em";
            })
            .attr("text-anchor", (d: any) => {
                if (d.data.type === 'attribute') return "start";
                return d.children ? "end" : "start";
            })
            .text((d: any) => {
                if (d.data.type === 'relationship') {
                    return `${d.data.name} → ${d.data.target}`;
                }
                return d.data.name;
            })
            .style("font-size", (d: any) => {
                if (d.data.type === 'attribute') return "13px";
                if (d.data.type === 'subclass') return "15px"; // Larger font for subclasses
                return "14px";
            })
            .style("fill", "#333")
            .style("pointer-events", "none");

        // Add descriptions on hover
        node.append("title")
            .text(d => d.data.description || "");

        // Zoom and pan behavior
        const zoom = d3.zoom()
            .scaleExtent([0.1, 4])
            .on("zoom", (event) => {
                g.attr("transform", event.transform);
            });

        svgEl.call(zoom);

        // Fit the graph to view
        const bounds = root.descendants().reduce((acc, d) => ({
            x0: Math.min(acc.x0, d.x),
            x1: Math.max(acc.x1, d.x),
            y0: Math.min(acc.y0, d.y),
            y1: Math.max(acc.y1, d.y)
        }), { x0: Infinity, x1: -Infinity, y0: Infinity, y1: -Infinity });

        const dx = bounds.x1 - bounds.x0;
        const dy = bounds.y1 - bounds.y0;
        const x = (bounds.x0 + bounds.x1) / 2;
        const y = (bounds.y0 + bounds.y1) / 2;
        const scale = Math.min(8, 0.9 / Math.max(dx / width, dy / height));
        const translate = [width / 2 - scale * y, height / 2 - scale * x];

        svgEl.transition()
            .duration(750)
            .call(zoom.transform, d3.zoomIdentity
                .translate(translate[0], translate[1])
                .scale(scale)
            );
    });
</script>

<svg 
    bind:this={svg} 
    class="w-full h-full bg-white rounded-lg shadow-lg"
    viewBox="0 0 1200 800"
    preserveAspectRatio="xMidYMid meet"
>
</svg>

<style>
    .link {
        fill: none;
        stroke: hsl(var(--foreground)/0.2);
        stroke-width: 1.5px;
        stroke-linecap: round;
        transition: stroke 0.2s ease;
    }

    .link:hover {
        stroke: hsl(var(--foreground)/0.4);
        stroke-width: 2px;
    }

    .node--superclass circle {
        r: 8;
        fill: hsl(var(--primary));
    }

    .node--subclass circle {
        r: 6;
        fill: hsl(var(--primary)/0.8);
    }

    .node--attribute circle {
        r: 4;
        fill: hsl(var(--primary)/0.6);
    }

    .node--relationship circle {
        r: 4;
        fill: hsl(var(--primary)/0.4);
    }

    .node text {
        font-family: 'Inter', sans-serif;
        fill: hsl(var(--foreground));
        transition: fill 0.2s ease;
    }

    .node--superclass text {
        font-weight: 600;
    }

    .node--relationship text {
        font-style: italic;
    }

    .node:hover circle {
        filter: brightness(1.1);
    }
</style> 