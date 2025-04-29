class WordCloud {
    constructor(_data, _config) {
        this.data = _data;
        this.config = _config;
        this.initVis();
    }

    initVis() {
        let vis = this;

        vis.margin = { top: 10, right: 10, bottom: 10, left: 10 };

        // Get the container and ensure it has valid dimensions
        const container = document.getElementById("bottom-left");
        const containerWidth = container.clientWidth || 800; // Fallback to 800px if width is 0
        const containerHeight = container.clientHeight || 600; // Fallback to 600px if height is 0

        vis.width = containerWidth - vis.margin.left - vis.margin.right;
        vis.height = containerHeight - vis.margin.top - vis.margin.bottom;

        // Define the SVG container
        vis.svg = d3.select(vis.config.parentElement)
            .append("svg")
                .attr("viewBox", [0, 0, container.clientWidth, container.clientHeight])
                .attr("preserveAspectRatio", "xMidYMid meet")
                .classed("responsive-svg", true)
            .append("g")
                .attr("transform", `translate(${vis.width / 2 + vis.margin.left}, ${vis.height / 2 + vis.margin.top})`);

        // Define the font size scale
        vis.fontSizeScale = d3.scaleLinear().range([10, 50]);

        // Initialize the word cloud layout
        vis.layout = d3.layout.cloud()
            .size([vis.width, vis.height]) // Use the adjusted width and height
            .padding(5)
            .rotate(() => (Math.random() > 0.5 ? 0 : 90)) // Randomly rotate words
            .font("Impact")
            .on("end", words => vis.renderVis(words));

        vis.updateVis(vis.data);
    }

    updateVis(data) {
        let vis = this;

        // Define a list of common filler words to exclude
        const stopWords = new Set([
            "i", "can", "my", "a", "it", "this", "the", "to", "or", "and", "of", "in", "on", "for", "is", "at", "with", "as", "by", "an", "be", "that", "are", "was", "were", "but", "not"
        ]);

        // Check the state of the "Include 'you'" toggle
        const includeYou = document.getElementById('include-you-toggle').checked;
        if (!includeYou) {
            stopWords.add("you"); // Add "you" to the stop words if the toggle is unchecked
        }

        // Filter out stop words
        vis.data = data.filter(d => !stopWords.has(d.word.toLowerCase()));

        // Update the font size scale
        vis.fontSizeScale.domain(d3.extent(vis.data, d => d.frequency));

        // Update the layout with new words
        vis.layout
            .words(vis.data.map(d => ({
                text: d.word,
                size: vis.fontSizeScale(d.frequency)
            })))
            .fontSize(d => d.size)
            .spiral("archimedean") // Use an Archimedean spiral for layout
            .start();
    }

    renderVis(words) {
        let vis = this;

        // Clear previous words
        vis.svg.selectAll("text").remove();

        // Render new words
        vis.svg
            .selectAll("text")
            .data(words)
            .enter()
            .append("text")
            .style("font-family", "Impact")
            .style("fill", () => d3.schemeCategory10[Math.floor(Math.random() * 10)])
            .attr("text-anchor", "middle")
            .attr("transform", d => {
                // Ensure words stay within the bounding box
                const x = Math.max(-vis.width / 2 + d.size / 2, Math.min(vis.width / 2 - d.size / 2, d.x));
                const y = Math.max(-vis.height / 2 + d.size / 2, Math.min(vis.height / 2 - d.size / 2, d.y));
                return `translate(${x}, ${y}) rotate(${d.rotate})`;
            })
            .style("font-size", d => `${d.size}px`)
            .text(d => d.text);
    }
}