class Heatmap {
    constructor(_data, _config) {
        this.data = _data;
        this.config = _config;
        this.initVis();
    }

    initVis() {
        let vis = this;
        
        vis.backupData = vis.data;

        console.log('initVis', vis.data);

        vis.margin = {top: 20, right: 30, bottom: 40, left: 100};
        vis.width = 500 - vis.margin.left - vis.margin.right;
        vis.height = 400 - vis.margin.top - vis.margin.bottom;

        vis.svg = d3.select("#heatmap")
            .append("svg")
                .attr("width", vis.width + vis.margin.left + vis.margin.right)
                .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
                .attr("transform",
                "translate(" + vis.margin.left + "," + vis.margin.top + ")");

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
            ['1','2','3','4','5','6','7','8','9'],
            ['1','2','3','4','5','6','7','8','9','10']];

        // Create x scale
        vis.xScale = d3.scaleBand()
            .range([0, vis.width])
            .domain(vis.episodes[0])
            .padding(0.01);

        vis.svg.append("g")
            .attr("transform", "translate(0," + vis.height + ")")
            .call(d3.axisBottom(vis.xScale).tickSize(0))
            .selectAll("text")
                .style("text-anchor", "end")
                .style("font-size", "8px")
                .style("font-family", "Arial, sans-serif");

        // Create y scale
        vis.yScale = d3.scaleBand()
            .range([0, vis.height])
            .domain(vis.characters)
            .padding(0.01);

        vis.svg.append("g")
            .call(d3.axisLeft(vis.yScale).tickSize(0))
            .selectAll("text")
                .attr("transform", "translate(-10,0)")
                .style("text-anchor", "end")
                .style("font-size", "12px")
                .style("font-family", "Arial, sans-serif");

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

        // Add this once to your SVG (before drawing the rectangles)
        vis.svg.append("defs")
            .append("pattern")
                .attr("id", "diagonalHatch")
                .attr("patternUnits", "userSpaceOnUse")
                .attr("width", 6)
                .attr("height", 6)
            .append("path")
                .attr("d", "M0,0 l6,6") // simple diagonal line
                .attr("stroke", "#ccc")
                .attr("stroke-width", 1);


        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        vis.renderVis();
    }

    renderVis() {
        let vis = this;

        console.log('renderVis', vis.data.wordCounts);

        vis.svg.selectAll()
            .data(vis.data.wordCounts.filter(d => vis.characters.includes(d.character)))
            .enter()
            .append("rect")
                .attr("x", d => vis.xScale(d.episodeId))
                .attr("y", d => vis.yScale(d.character))
                .attr("width", vis.xScale.bandwidth())
                .attr("height", vis.yScale.bandwidth())
            .style("fill", d => {
                return (d.value == null || isNaN(d.value) || d.value === 0)
                  ? "url(#diagonalHatch)"
                  : vis.colorScale(d.value);
            })
            .on('mouseover', (event, d) => {
                vis.tooltip
                    .style('opacity', 1)
                    .html(`${d.character}<br>${d.episodeId}<br>${d.value} words`)
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
        if (season == 'All Seasons') {
            vis.xScale.domain(episodes[0]);
            vis.data.wordCounts = vis.backupWordCounts;
        } else if (season == 'Season 1') {
            vis.xScale.domain(episodes[1]);
            vis.data.wordCounts = vis.backupWordCounts[1];
        } else if (season == 'Season 2') {
            vis.xScale.domain(episodes[2]);
            vis.data.wordCounts = vis.backupWordCounts[2];
        }
    }
}