class Heatmap {
    constructor(_data, _config) {
        this.data = _data;
        this.config = _config;
        this.initVis();
    }

    initVis() {
        let vis = this;
        
        console.log('initVis', vis.data);
        vis.backupWordCounts = vis.data.wordCounts;

        vis.margin = {top: 50, right: 30, bottom: 50, left: 80};

        // Make the SVG responsive to the size of the "left" parent container
        const container = document.getElementById("left");
        vis.width = container.clientWidth - vis.margin.left - vis.margin.right;
        vis.height = container.clientHeight - vis.margin.top - vis.margin.bottom;

        vis.svg = d3.select("#heatmap")
            .append("svg")
                .attr("viewBox", [0, 0, container.clientWidth, container.clientHeight])
                .attr("preserveAspectRatio", "xMidYMid meet")
                .classed("responsive-svg", true);

        // Add "crossed-out" texture for episodes with 0 words
        vis.svg.append("defs")
            .append("pattern")
                .attr("id", "diagonalHatch")
                .attr("patternUnits", "userSpaceOnUse")
                .attr("width", 6)
                .attr("height", 6)
            .append("path")
                .attr("d", "M0,0 l6,6")
                .attr("stroke", "#999")
                .attr("stroke-width", 1);

        vis.svg = vis.svg.append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        // Get top 10 characters by words spoken for both seasons
        const characterTotals = {};
        vis.data.wordCounts.forEach(d => {
            if (!characterTotals[d.character]) {
              characterTotals[d.character] = 0;
            }
            characterTotals[d.character] += d.value;
        });
          
        // Get top 10 characters by word count
        const top10 = Object.entries(characterTotals)
            .sort((a, b) => b[1] - a[1])       // sort by word count descending
            .slice(0, 10)                      // take top 10
            .map(([character, _]) => character); // get just the character names
        
        // Alphabetize those 10
        vis.characters = top10.sort();

        vis.episodes = [['S1E1','S1E2','S1E3','S1E4','S1E5','S1E6','S1E7','S1E8','S1E9','S2E1','S2E2','S2E3','S2E4','S2E5','S2E6','S2E7','S2E8','S2E9','S2E10'],
            ['S1E1','S1E2','S1E3','S1E4','S1E5','S1E6','S1E7','S1E8','S1E9'],
            ['S2E1','S2E2','S2E3','S2E4','S2E5','S2E6','S2E7','S2E8','S2E9','S2E10']];

        // Create x scale
        vis.xScale = d3.scaleBand()
            .range([0, vis.width])
            .domain(vis.episodes[0])
            .padding(0.01);

        vis.xAxis = d3.axisBottom(vis.xScale).tickSize(0);
        vis.xAxisGroup = vis.svg.append("g")
            .attr("transform", "translate(0," + vis.height + ")");

        // Create y scale
        vis.yScale = d3.scaleBand()
            .range([0, vis.height])
            .domain(vis.characters)
            .padding(0.01);

        vis.yAxis = d3.axisLeft(vis.yScale).tickSize(0);
        vis.yAxisGroup = vis.svg.append("g")
            .attr("transform", "translate(-1,0)");

        // Create color scale
        vis.colorScale = d3.scaleLinear()
            .domain([0, d3.max(vis.data.wordCounts, d => d.value)])
            .range(["#ffffff", "#1f77b4"]);

        // Tooltip
        vis.tooltip = d3
            .select('body')
            .append('div')
            .attr('class', 'tooltip')
            .style('opacity', 0);

        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        console.log('updateVis', vis.data.wordCounts);

        // Clear previous visualizations (removing rects)
        vis.svg.selectAll("rect").remove();

        vis.xAxisGroup.call(vis.xAxis)
            .selectAll("text")
            .style("transform", "translate(5, 0)")
            .style("font-size", "12px")
            .style("font-family", "Arial, sans-serif");
        vis.yAxisGroup.call(vis.yAxis)
            .selectAll("text")
            .attr("transform", "translate(-10,0)")
            .style("text-anchor", "end")
            .style("font-size", "12px")
            .style("font-family", "Arial, sans-serif");

        vis.renderVis();
    }

    renderVis() {
        let vis = this;

        console.log('renderVis', vis.data.wordCounts);

        const dataMap = new Map();
        vis.data.wordCounts.forEach(d => {
            dataMap.set(`${d.character}-${d.episodeId}`, d.value);
        });

        // Generate all combinations of characters × episodes
        const plotData = [];
        vis.characters.forEach(character => {
            vis.xScale.domain().forEach(episodeId => {
                const key = `${character}-${episodeId}`;
                plotData.push({
                    character,
                    episodeId,
                    value: dataMap.has(key) ? dataMap.get(key) : null // null means no data
                });
            });
        });

        vis.svg.selectAll()
            .data(plotData)
            .enter()
            .append("rect")
                .attr("x", d => vis.xScale(d.episodeId))
                .attr("y", d => vis.yScale(d.character))
                .attr("width", vis.xScale.bandwidth())
                .attr("height", vis.yScale.bandwidth())
            // Set color based on value, or use the hatch pattern for null values
            .style("fill", d => d.value !== null ? vis.colorScale(d.value) : "url(#diagonalHatch)")
            .style("stroke", "#999")
            .on('mouseover', (event, d) => {
                vis.tooltip
                    .style('opacity', 1)
                    .html(d.value !== null ? `${d.character}<br>${d.episodeId}<br>${d.value} words` : `${d.character}<br>${d.episodeId}<br>0 words`)
                    .style('left', `${event.pageX + 10}px`)
                    .style('top', `${event.pageY + 10}px`);
            })
            .on('mousemove', event => {
                vis.tooltip.style('left', `${event.pageX + 10}px`).style('top', `${event.pageY + 10}px`);
            })
            .on('mouseleave', () => {
                vis.tooltip.style('opacity', 0);
            })
    }

    updateSeason(season) {
        let vis = this;
        if (season == 'all') {
            vis.xScale.domain(vis.episodes[0]);
            vis.data.wordCounts = vis.backupWordCounts;
        } else if (season == 'season1') {
            vis.xScale.domain(vis.episodes[1]);
            vis.data.wordCounts = vis.backupWordCounts.filter(d => d.episodeId.startsWith('S1'));
        } else if (season == 'season2') {
            vis.xScale.domain(vis.episodes[2]);
            vis.data.wordCounts = vis.backupWordCounts.filter(d => d.episodeId.startsWith('S2'));
        }
        vis.updateVis();
    }
}