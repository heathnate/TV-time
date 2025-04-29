class Heatmap {
    constructor(_data, _config) {
        this.data = _data;
        this.config = _config;
        this.initVis();
    }

    initVis() {
        let vis = this;

        vis.characters = vis.data.characters;

        // Default selected characters
        vis.selectedCharacters = ['Burt', 'Cobel', 'Devon', 'Dylan', 'Helly', 'Irving', 'Mark', 'Milchick', 'Reghabi', 'Ricken'];

        // Populate character multiselect dropdown
        const characterScrollContainer = document.getElementById('character-scroll-container');
        vis.characters.forEach(character => {
            const label = document.createElement('label');
            label.innerHTML = `
                <input type="checkbox" value="${character}">
                ${character}
            `;
            characterScrollContainer.appendChild(label);
        });

        // Check the "Top 10 Characters" option by default
        const top10Option = document.getElementById('top10-option');
        top10Option.checked = true;

        // Add event listener for "Top 10 Characters" checkbox
        top10Option.addEventListener('change', () => {
            if (top10Option.checked) {
                // Uncheck all other character checkboxes
                const checkboxes = document.querySelectorAll('#character-scroll-container input[type="checkbox"]');
                checkboxes.forEach(checkbox => checkbox.checked = false);

                // Select Top 10 characters
                vis.selectedCharacters = vis.characters.slice(0, 10);
            }
        });

        // Add event listener for individual character checkboxes
        characterScrollContainer.addEventListener('change', (event) => {
            if (event.target.type === 'checkbox') {
                // Uncheck "Top 10 Characters" if any other checkbox is checked
                if (event.target.checked) {
                    top10Option.checked = false;
                }
            }
        });

        // Add event listener for "Done" button
        document.getElementById('character-multiselect-done').addEventListener('click', () => {
            const checkboxes = document.querySelectorAll('#character-scroll-container input[type="checkbox"]');

            if (top10Option.checked) {
                // Select Top 10 characters
                vis.selectedCharacters = vis.characters.slice(0, 10);
            } else {
                // Get selected characters
                vis.selectedCharacters = Array.from(checkboxes)
                    .filter(checkbox => checkbox.checked)
                    .map(checkbox => checkbox.value);
            }

            // Hide the dropdown
            document.getElementById('character-multiselect-dropdown').classList.add('hidden');

            // Update the heatmap
            vis.updateVis();
        });

        // Add event listener to toggle dropdown visibility
        document.getElementById('character-multiselect-button').addEventListener('click', () => {
            const dropdown = document.getElementById('character-multiselect-dropdown');
            dropdown.classList.toggle('hidden');
        });        
        
        // Backup data to replace filtered data from season selection
        vis.backupWordCounts = vis.data.wordCounts;

        vis.margin = {top: 50, right: 30, bottom: 50, left: 80};

        // Make the SVG responsive to the size of the "top-left" parent container
        const container = document.getElementById("top-left");
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
        
        // Sort top 10 characters alphabetically
        vis.characters = top10.sort();

        vis.episodes = [['S1E1','S1E2','S1E3','S1E4','S1E5','S1E6','S1E7','S1E8','S1E9','S2E1','S2E2','S2E3','S2E4','S2E5','S2E6','S2E7','S2E8','S2E9','S2E10'],
            ['S1E1','S1E2','S1E3','S1E4','S1E5','S1E6','S1E7','S1E8','S1E9'],
            ['S2E1','S2E2','S2E3','S2E4','S2E5','S2E6','S2E7','S2E8','S2E9','S2E10']];

        // Create x scale and axis
        vis.xScale = d3.scaleBand()
            .range([0, vis.width])
            .domain(vis.episodes[0])
            .padding(0.01);

        vis.xAxis = d3.axisBottom(vis.xScale).tickSize(0);
        vis.xAxisGroup = vis.svg.append("g")
            .attr("transform", "translate(0," + vis.height + ")");

        // Create y scale and axis
        vis.yScale = d3.scaleBand()
            .range([0, vis.height])
            .domain(vis.characters)
            .padding(0.01);

        vis.yAxis = d3.axisLeft(vis.yScale).tickSize(0);
        vis.yAxisGroup = vis.svg.append("g")
            .attr("class", "y-axis")
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

        // Clear previous visualizations (removing rects)
        vis.svg.selectAll("rect").remove();

        // Reset y axis to show new selected characters
        vis.yScale.domain(vis.selectedCharacters);

        // Redraw axes depending on updated seasons/characters
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

        // Filter data based on selected characters
        vis.filteredData = vis.data.wordCounts.filter(d => vis.selectedCharacters.includes(d.character));

        // Recalculate color scale based on filtered data for clearer differences
        vis.colorScale.domain([0, d3.max(vis.filteredData, d => d.value)]);

        vis.renderVis();
    }

    renderVis() {
        let vis = this;

        // Create lookup table
        const dataMap = new Map();
        vis.filteredData.forEach(d => {
            dataMap.set(`${d.character}-${d.episodeId}`, d.value);
        });

        // Generate all combinations of characters × episodes
        // This way we know when to apply the hatch pattern (for no data)
        const plotData = [];
        vis.selectedCharacters.forEach(character => {
            vis.xScale.domain().forEach(episodeId => {
                const key = `${character}-${episodeId}`;
                plotData.push({
                    character,
                    episodeId,
                    value: dataMap.has(key) ? dataMap.get(key) : null
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
            });
        
        // Character tooltip
        vis.svg.selectAll(".y-axis text")
            .on('mouseover', (event, d) => {
                vis.tooltip
                    .style('opacity', 1)
                    .html(`${d}<br>
                        Total Words: ${vis.data.characterStats[d].totalWords}<br>
                        Total Episodes: ${vis.data.characterStats[d].totalEpisodes}`)
                    .style('left', `${event.pageX + 10}px`)
                    .style('top', `${event.pageY + 10}px`);
            })
            .on('mousemove', event => {
                vis.tooltip.style('left', `${event.pageX + 10}px`).style('top', `${event.pageY + 10}px`);
            })
            .on('mouseleave', () => {
                vis.tooltip.style('opacity', 0);
            });
    }

    // Update the heatmap data and x scale based on season selection
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