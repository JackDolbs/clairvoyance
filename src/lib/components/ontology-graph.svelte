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
            .size([innerHeight * 20, innerWidth * 1.5]) // Dramatically increase both dimensions
            .separation((a: any, b: any) => {
                // Maximum separation between category and non-category nodes
                if (a.data.type === 'category' && b.data.type !== 'category' ||
                    a.data.type !== 'category' && b.data.type === 'category') {
                    return 25; // Much more space between categories and nodes
                }
                // Large separation between categories
                if (a.data.type === 'category' && b.data.type === 'category') {
                    return 15;
                }
                // Add extra space for attributes
                if (a.data.type === 'attribute' || b.data.type === 'attribute') {
                    return 20;
                }
                // Add extra space for subclasses
                if (a.data.type === 'subclass' || b.data.type === 'subclass') {
                    return 25;
                }
                // Add extra space for relationships
                if (a.data.type === 'relationship' || b.data.type === 'relationship') {
                    return 20;
                }
                // Default separation for siblings vs non-siblings
                return a.parent === b.parent ? 15 : 30;
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

        // Add simple relationship lines
        const link = g.selectAll(".link")
            .data(root.links())
            .enter().append("line") // Changed from path to line
            .attr("class", "link")
            .attr("x1", d => d.source.y)
            .attr("y1", d => d.source.x)
            .attr("x2", d => d.target.y)
            .attr("y2", d => d.target.x)
            .style("stroke", "#ccc") // Simple gray color
            .style("stroke-width", 1) // Thinner line
            .style("stroke-linecap", "round");

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
                // Add simple category label
                const text = node.append("text")
                    .attr("class", "category-text")
                    .attr("x", 0)
                    .attr("y", 0)
                    .style("font-family", "monospace")
                    .style("font-size", "12px")
                    .style("fill", "#666")
                    .style("text-anchor", "middle")
                    .text(d.data.name);

                // Add subtle background
                const bbox = text.node().getBBox();
                node.insert("rect", "text")
                    .attr("class", "category-rect")
                    .attr("x", bbox.x - 10)
                    .attr("y", bbox.y - 5)
                    .attr("width", bbox.width + 20)
                    .attr("height", bbox.height + 10)
                    .attr("rx", 4)
                    .style("fill", "#2a2a2a")
                    .style("stroke", "#444")
                    .style("stroke-width", 1);

                return; // Skip the regular node rendering for category nodes
            }

            // Regular node rendering code for non-category nodes
            // Add text content first (to measure it)
            const text = node.append("text")
                .attr("class", "node-text")
                .attr("x", -140)
                .attr("y", -20)
                .style("font-family", "monospace")
                .style("font-size", "13px")
                .style("fill", "#fff");

            // Add name with blue color for property name
            const nameText = text.append("tspan")
                .attr("x", -140)
                .attr("dy", 0);
            
            nameText.append("tspan")
                .style("fill", "#5fb0ff")
                .text("name: ");
            
            nameText.append("tspan")
                .style("fill", "#fff")
                .text(`"${d.data.name}"`);

            // Add description with blue property name
            const descText = text.append("tspan")
                .attr("x", -140)
                .attr("dy", "2.5em");
            
            // Add description label
            descText.append("tspan")
                .style("fill", "#5fb0ff")
                .text("description: ");
            
            // Add description value with wrapping, starting on same line
            const descValue = `"${d.data.description || 'N/A'}"`;
            const words = descValue.split(/\s+/);
            let line = [words[0]]; // Start with first word
            let lineNumber = 1;
            const maxWidth = 260;

            // Test first line including "description: "
            const firstLine = descText.append("tspan")
                .style("fill", "#fff")
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
                            .attr("x", -140)
                            .attr("dy", "1.4em")
                            .style("fill", "#fff")
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
                        .attr("x", -140)
                        .attr("dy", "1.4em")
                        .style("fill", "#fff")
                        .text(line.join(" "));
                }
            }

            // Get the bounding box of all the text
            const textBox = text.node().getBBox();
            
            // Add rectangle sized to fit text with more padding
            node.insert("rect", "text")
                .attr("class", "node-rect")
                .attr("x", textBox.x - 20)
                .attr("y", textBox.y - 20)
                .attr("width", textBox.width + 40)
                .attr("height", textBox.height + 40)
                .attr("rx", 4)
                .style("fill", "#1c1c1c")
                .style("stroke", "#333")
                .style("stroke-width", 1);

            // Add separator line after measuring text height
            node.insert("line", "text")
                .attr("x1", textBox.x - 20)
                .attr("y1", -5)
                .attr("x2", textBox.x + textBox.width + 20)
                .attr("y2", -5)
                .attr("stroke", "#333")
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
    class="w-full h-full bg-white rounded-lg shadow-lg"
    viewBox="0 0 1200 800"
    preserveAspectRatio="xMidYMid meet"
>
</svg>

<style>
    .link {
        fill: none;
        stroke: #ccc;
        stroke-width: 1;
        transition: stroke 0.2s ease;
    }

    .link:hover {
        stroke: #999;
        stroke-width: 1.2;
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
        filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
    }

    .node-text {
        pointer-events: none;
        font-family: "Monaco", "Menlo", "Ubuntu Mono", "Consolas", monospace;
    }

    .node-text tspan {
        font-family: monospace; /* For better alignment */
        font-size: 11px;
    }

    .node-text tspan:first-child {
        font-weight: 500;
    }

    .category-text {
        pointer-events: none;
        font-family: "Monaco", "Menlo", "Ubuntu Mono", "Consolas", monospace;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }

    .category-rect {
        filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
        opacity: 0.8;
    }
</style> 