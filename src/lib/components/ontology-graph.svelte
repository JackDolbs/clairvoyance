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
            .size([innerHeight * 20, innerWidth * 4]) // Increased from 2.5 to 4
            .separation((a: any, b: any) => {
                // Maximum separation between category and non-category nodes
                if (a.data.type === 'category' && b.data.type !== 'category' ||
                    a.data.type !== 'category' && b.data.type === 'category') {
                    return 50; // Increased from 35
                }
                // Large separation between categories
                if (a.data.type === 'category' && b.data.type === 'category') {
                    return 40; // Increased from 25
                }
                // Add extra space for attributes
                if (a.data.type === 'attribute' || b.data.type === 'attribute') {
                    return 45; // Increased from 30
                }
                // Add extra space for subclasses
                if (a.data.type === 'subclass' || b.data.type === 'subclass') {
                    return 50; // Increased from 35
                }
                // Add extra space for relationships
                if (a.data.type === 'relationship' || b.data.type === 'relationship') {
                    return 45; // Increased from 30
                }
                // Default separation for siblings vs non-siblings
                return a.parent === b.parent ? 40 : 60; // Increased from 25:40
            });

        // Process data into hierarchical structure with category nodes
        function processData(data: any) {
            return {
                name: data.ontology.name,
                description: data.ontology.description,
                children: [{
                    name: "superclasses",
                    type: 'category',
                    children: data.ontology.superclasses.map(superclass => ({
                        ...superclass,
                        type: 'superclass',
                        children: [
                            {
                                name: "attributes",
                                type: 'category',
                                children: superclass.attributes?.map(attr => ({
                                    ...attr,
                                    type: 'attribute'
                                })) || []
                            },
                            {
                                name: "subclasses",
                                type: 'category',
                                children: superclass.subclasses?.map(subclass => ({
                                    ...subclass,
                                    type: 'subclass',
                                    children: [
                                        {
                                            name: "attributes",
                                            type: 'category',
                                            children: subclass.attributes?.map(attr => ({
                                                ...attr,
                                                type: 'attribute'
                                            })) || []
                                        },
                                        {
                                            name: "relationships",
                                            type: 'category',
                                            children: subclass.relationships?.map(rel => ({
                                                ...rel,
                                                type: 'relationship'
                                            })) || []
                                        }
                                    ]
                                })) || []
                            }
                        ]
                    }))
                }]
            };
        }

        const root = d3.hierarchy(processData(data));
        cluster(root);

        const svgEl = d3.select(svg);
        svgEl.selectAll("*").remove();
        
        const g = svgEl.append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // Add simple relationship lines (without arrows)
        const link = g.selectAll(".link")
            .data(root.links())
            .enter().append("line")
            .attr("class", "link")
            .attr("x1", d => d.source.y)
            .attr("y1", d => d.source.x)
            .attr("x2", d => d.target.y)
            .attr("y2", d => d.target.x)
            .style("stroke", "#4a72bf")
            .style("stroke-width", 1.5);

        // Create node groups
        const node = g.selectAll(".node")
            .data(root.descendants())
            .enter().append("g")
            .attr("class", d => `node node--${d.data.type}`)
            .attr("transform", d => `translate(${d.y},${d.x})`);

        // Add special styling for category nodes
        node.each(function(d) {
            const node = d3.select(this);
            
            if (d.data.type === 'category') {
                // Create container for category
                const container = node.append("g")
                    .attr("class", "category-container");

                // Add simple category label
                const text = container.append("text")
                    .attr("class", "category-text")
                    .attr("x", 0)
                    .attr("y", 0)
                    .style("font-family", "monospace")
                    .style("font-size", "12px")
                    .style("fill", "#e65d20")
                    .style("text-anchor", "middle")
                    .text(d.data.name);

                const bbox = text.node().getBBox();

                // Add subtle background
                container.insert("rect", "text")
                    .attr("class", "category-rect")
                    .attr("x", bbox.x - 10)
                    .attr("y", bbox.y - 5)
                    .attr("width", bbox.width + 45)
                    .attr("height", bbox.height + 10)
                    .attr("rx", 4)
                    .style("fill", "#ffffff")
                    .style("stroke", "#4a72bf")
                    .style("stroke-width", 1);

                // Add vertical separator line
                container.append("line")
                    .attr("x1", bbox.x + bbox.width + 5)
                    .attr("y1", bbox.y - 2)
                    .attr("x2", bbox.x + bbox.width + 5)
                    .attr("y2", bbox.y + bbox.height + 2)
                    .style("stroke", "#4a72bf")
                    .style("stroke-width", 1);

                // Add clickable area for the right side
                const toggleArea = container.append("rect")
                    .attr("x", bbox.x + bbox.width + 6)
                    .attr("y", bbox.y - 4)
                    .attr("width", 28)
                    .attr("height", bbox.height + 8)
                    .style("fill", "transparent")
                    .style("cursor", "pointer")
                    .on("click", (event) => {
                        const isHidden = container.property("isHidden") || false;
                        container.property("isHidden", !isHidden);
                        
                        // Get ALL descendants instead of just direct children
                        const allDescendants = d.descendants();
                        // Remove the category node itself from the list
                        allDescendants.shift();
                        
                        // Toggle visibility of all descendant nodes
                        g.selectAll(".node")
                            .filter(node => allDescendants.includes(node))
                            .style("opacity", !isHidden ? 0 : 1)
                            .style("pointer-events", !isHidden ? "none" : "all");

                        // Toggle visibility of all descendant links
                        g.selectAll(".link")
                            .filter(link => allDescendants.includes(link.target))
                            .style("opacity", !isHidden ? 0 : 1);

                        // Update flashlight icon colors
                        flashlightIcon.select(".flashlight-body")
                            .style("stroke", !isHidden ? "#666" : "#e65d20");
                        flashlightIcon.select(".flashlight-beam")
                            .style("fill", !isHidden ? "#666" : "#e65d20");
                    });

                // Add flashlight icon (now just for visual indication)
                const flashlightIcon = container.append("g")
                    .attr("class", "flashlight-icon")
                    .attr("transform", `translate(${bbox.x + bbox.width + 10}, ${bbox.y + (bbox.height/2)})`);

                // Flashlight body
                flashlightIcon.append("path")
                    .attr("class", "flashlight-body")
                    .attr("d", "M2,7 L8,7 L12,3 L12,11 L8,7")
                    .attr("transform", "scale(0.8) translate(-2, -5)")
                    .style("fill", "none")
                    .style("stroke", "#e65d20")
                    .style("stroke-width", 2)
                    .style("stroke-linejoin", "round")
                    .style("stroke-linecap", "round");

                // Flashlight beam
                flashlightIcon.append("path")
                    .attr("class", "flashlight-beam")
                    .attr("d", "M12,7 L15,7 L18,4 L18,10 L15,7")
                    .attr("transform", "scale(0.8) translate(-2, -5)")
                    .style("fill", "#e65d20")
                    .style("fill-opacity", 0.5);

                return;
            }

            // Regular node rendering code for non-category nodes
            const text = node.append("text")
                .attr("class", "node-text")
                .attr("x", -180)
                .attr("y", -20)
                .style("font-family", "monospace")
                .style("font-size", "13px")
                .style("fill", "#000000");

            // Add name with blue color for property name
            const nameText = text.append("tspan")
                .attr("x", -180)
                .attr("dy", 0);
            
            nameText.append("tspan")
                .style("fill", "#4a72bf") // Blue for property name
                .text("name: ");
            
            nameText.append("tspan")
                .style("fill", "#000000") // Black for value
                .text(`"${d.data.name}"`);

            // Add description with blue property name
            const descText = text.append("tspan")
                .attr("x", -180)
                .attr("dy", "2.5em");
            
            // Add description label in blue
            descText.append("tspan")
                .style("fill", "#4a72bf") // Blue for property name
                .text("description: ");

            // Add description value with wrapping, starting on same line
            const descValue = `"${d.data.description || 'N/A'}"`;
            const words = descValue.split(/\s+/);
            let line = [words[0]]; // Start with first word
            let lineNumber = 1;
            const maxWidth = 340;

            // Test first line including "description: "
            const firstLine = descText.append("tspan")
                .style("fill", "#000000") // Changed from #fff to black
                .text(line[0]);

            // Process remaining words
            for (let i = 1; i < words.length; i++) {
                line.push(words[i]);
                const testLine = line.join(" ");
                const testElem = text.append("tspan").text(testLine);
                const testWidth = testElem.node().getComputedTextLength();
                testElem.remove();

                if (testWidth > maxWidth) {
                    line.pop();
                    if (lineNumber === 1) {
                        firstLine.text(line.join(" ")); // Update first line
                    } else {
                        text.append("tspan")
                            .attr("x", -180)
                            .attr("dy", "1.4em")
                            .style("fill", "#000000") // Changed from #fff to black
                            .text(line.join(" "));
                    }
                    line = [words[i]];
                    lineNumber++;
                }
            }

            // Add remaining words
            if (line.length > 0) {
                if (lineNumber === 1) {
                    firstLine.text(line.join(" ")); // Update first line
                } else {
                    text.append("tspan")
                        .attr("x", -180)
                        .attr("dy", "1.4em")
                        .style("fill", "#000000") // Changed from #fff to black
                        .text(line.join(" "));
                }
            }

            // Get the bounding box of all the text
            const textBox = text.node().getBBox();
            
            // Add rectangle with more width
            node.insert("rect", "text")
                .attr("class", "node-rect")
                .attr("x", textBox.x - 30)
                .attr("y", textBox.y - 20)
                .attr("width", textBox.width + 60)
                .attr("height", textBox.height + 40)
                .attr("rx", 4)
                .style("fill", "#ffffff")
                .style("stroke", "#4a72bf")
                .style("stroke-width", 1);

            // Update separator line width
            node.insert("line", "text")
                .attr("x1", textBox.x - 30)
                .attr("y1", -5)
                .attr("x2", textBox.x + textBox.width + 30)
                .attr("y2", -5)
                .attr("stroke", "#4a72bf")
                .attr("stroke-width", 1);
        });

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
    class="w-full h-full rounded-lg"
    viewBox="0 0 1200 800"
    preserveAspectRatio="xMidYMid meet"
>
</svg>

<style>
    .link {
        fill: none;
        stroke: #4a72bf; /* Match box border color */
        stroke-width: 1.5;
        transition: all 0.2s ease;
    }

    .link:hover {
        stroke: #6889cf; /* Slightly lighter blue on hover */
        stroke-width: 2;
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

    .node-rect {
        filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
    }

    .node-text {
        pointer-events: none;
        font-family: "Monaco", "Menlo", "Ubuntu Mono", "Consolas", monospace;
    }

    .node-text tspan {
        font-family: monospace;
        font-size: 11px;
        fill: #000000; /* Default text color black */
    }

    .node-text tspan:first-child {
        font-weight: 500;
    }

    .category-text {
        pointer-events: none;
        font-family: "Monaco", "Menlo", "Ubuntu Mono", "Consolas", monospace;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        fill: #e65d20; /* Darker orange */
    }

    .category-rect {
        filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
        opacity: 0.8;
    }

    .flashlight-icon {
        transition: all 0.2s ease;
    }

    .flashlight-icon:hover .flashlight-body {
        stroke-width: 2.5;
    }

    .flashlight-icon:hover .flashlight-beam {
        filter: brightness(1.2);
    }
</style> 