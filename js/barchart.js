class Barchart {
    constructor(_data, _config) {
        this.data = _data;
        this.config = _config;
        this.initVis();
    }
    initVis() {
        let vis = this;

        vis.margin = {top: 10, right: 30, bottom: 50, left: 30};

        vis.container = document.getElementById("barchart");
        vis.width = vis.container.clientWidth - vis.margin.left - vis.margin.right;
        vis.height = vis.container.clientHeight - vis.margin.top - vis.margin.bottom;

        vis.char_first = document.getElementById("character-severance-first");
        vis.char_most  = document.getElementById("character-severance-most");
        vis.char_last  = document.getElementById("character-severance-last");

        vis.epi_first = document.getElementById("episode-severance-first");
        vis.epi_most  = document.getElementById("episode-severance-most");
        vis.epi_last  = document.getElementById("episode-severance-last");

        vis.sea_first = document.getElementById("season-severance-first");
        vis.sea_most = document.getElementById("season-severance-most");
        vis.sea_last = document.getElementById("season-severance-last");

        vis.character_id = document.getElementById("btm-right-char-identifier");
        vis.content = document.getElementById("btm-right-content");
        vis.nocontent = document.getElementById("btm-right-nocontent");

        vis.x = d3.scaleBand()
            .range([0,vis.width])
            .domain(["S1 E1","S1 E2","S1 E3","S1 E4","S1 E5","S1 E6","S1 E7","S1 E8","S1 E9","S2 E1","S2 E2","S2 E3","S2 E4","S2 E5","S2 E6","S2 E7","S2 E8","S2 E9","S2 E10"])
            .padding(0.15);
        
        vis.svg = d3.select("#barchart")
            .append("svg")
                .attr("viewBox", [0, 0, vis.container.clientWidth, vis.container.clientHeight])
                .attr("preserveAspectRatio", "xMidYMid meet")
                .classed("responsive-svg", true)
            .append("g")
            .attr("transform", `translate(${vis.margin.left},${vis.margin.top})`);
                
        vis.xaxis = vis.svg.append("g")
                .attr("transform", `translate(0,${vis.height})`)
                .call(d3.axisBottom(vis.x))
                .selectAll("text")
                    .attr("transform","translate(-10,0)rotate(-45)")
                    .style("text-anchor","end");
        vis.yaxis = vis.svg.append("g");
        
        vis.updateVis("all");
    }
    mappedName(character) {
        if (character in this.config.mapping) return this.config.mapping[character]
        return character;
    }
    updateVis(character) {
        let vis = this;

        var m_character = vis.mappedName(character);

        vis.character_id.innerHTML = m_character == "all" ? "(from All Characters)" : `(from ${m_character})`;

        let cdata = vis.data;
        if (m_character != "all")
            cdata = cdata.filter(d => {
                return vis.mappedName(d["Character"]) == m_character;
            });
        if (cdata.length > 0) {   
            vis.content.className = "";
            vis.container.className = "";
            vis.nocontent.className = "disabled"; 
               
            var first = cdata[0]
            var last = cdata[cdata.length-1]
            var most;

            if (m_character == "all") {
                let characters = {};
                cdata.forEach(row => {
                    
                    let c = vis.mappedName(row["Character"]);

                    if (c in characters) characters[c] = characters[c] + 1;
                    else characters[c] = 1;
                });
                
                most = Object.keys(characters).reduce((a,b) => characters[a] ? a : b);
            }
            else {
                let episodes = {};
                cdata.forEach(row => {
                    let e = `S${row["Season"]}E${row["Episode_num"]}`;

                    if (e in episodes) episodes[e] = episodes[e] + 1;
                    else episodes[e] = 1;
                })
                most = Object.keys(episodes)[0];
                Object.keys(episodes).forEach(ep => {
                    if (episodes[ep] > episodes[most]) most = ep;
                });
                most = most.substring(1).split('E');
            }

            vis.char_first.innerHTML = vis.mappedName(first["Character"]);
            vis.epi_first.innerHTML = first["Episode_num"];
            vis.sea_first.innerHTML = first["Season"];

            vis.char_last.innerHTML = vis.mappedName(last["Character"]);
            vis.epi_last.innerHTML = last["Episode_num"];
            vis.sea_last.innerHTML = last["Season"];

            if (m_character == "all") {
                vis.char_most.innerHTML = vis.mappedName(most);
                vis.epi_most.parentElement.className = "disabled";
                vis.sea_most.parentElement.className = "disabled";
            }
            else {
                vis.char_most.innerHTML = m_character;
                vis.epi_most.parentElement.className = "";
                vis.sea_most.parentElement.className = "";

                vis.epi_most.innerHTML = most[1];
                vis.sea_most.innerHTML = most[0];

            }
        
            var episode_count = [];
            vis.x.domain().forEach(t => {
                episode_count.push({"count":0,"ep":t});
            });

            cdata.forEach(row => {
                episode_count[(parseInt(row["Episode_num"]) + (parseInt(row["Season"]) - 1) * 9) - 1]["count"]++;
            });

            vis.y = d3.scaleLinear()
                .domain([0, d3.max(episode_count, d => d["count"])])
                .range([vis.height,0]);
            vis.yaxis.call(d3.axisLeft(vis.y).ticks(vis.y.domain()[1]));

            vis.svg.selectAll("rect")
                .data(episode_count)
                .join("rect")
                    .attr("x", d => vis.x(d["ep"]))
                    .attr("y", d => vis.y(d["count"]))
                    .attr("width", vis.x.bandwidth())
                    .attr("height", d => vis.height - vis.y(d["count"]))
                    .attr("fill","cornflowerblue");
        }
        else {
            vis.content.className = "disabled";
            vis.container.className = "disabled";
            vis.nocontent.className = ""; 
        }
    }
}
