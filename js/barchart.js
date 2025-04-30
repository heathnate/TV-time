class Barchart {
    constructor(_data, _config) {
        this.data = _data;
        this.config = _config;
        this.initVis();
    }
    initVis() {
        let vis = this;

        vis.margin = {top: 50, right: 30, bottom: 50, left: 80};

        const container = document.getElementById("barchart");
        vis.width = container.clientWidth - vis.margin.left - vis.margin.right;
        vis.height = container.clientHeight - vis.margin.top - vis.margin.bottom;
        
        vis.svg = d3.select("#barchart")
            .append("svg")
                .attr("viewBox", [0, 0, container.clientWidth, container.clientHeight])
                .attr("preserveAspectRatio", "xMidYMid meet")
                .classed("responsive-svg", true)
            .append("g")
                .attr("transform", `translate(${vis.margin.left},${vis.margin.top}`);

        vis.char_first = document.getElementById("character-severance-first");
        vis.char_most  = document.getElementById("character-severance-most");
        vis.char_last  = document.getElementById("character-severance-last");

        vis.epi_first = document.getElementById("episode-severance-first");
        vis.epi_most  = document.getElementById("episode-severance-most");
        vis.epi_last  = document.getElementById("episode-severance-last");

        vis.sea_first = document.getElementById("season-severance-first");
        vis.sea_most = document.getElementById("season-severance-most");
        vis.sea_last = document.getElementById("season-severance-last");

        vis.updateVis("all");
    }
    mappedName(character) {
        if (character in this.config.mapping) return this.config.mapping[character]
        return character;
    }
    updateVis(character) {
        let vis = this;
        
        var m_character = vis.mappedName(character);

        let cdata = vis.data;
        if (m_character != "all")
            cdata = cdata.filter(d => {
                return vis.mappedName(d["Character"]) == m_character;
            });
        if (cdata.length > 0) {        
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
                most = Object.keys(episodes).reduce((a,b) => episodes[a] ? a : b).substring(1).split('E');
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
        }
        console.log(character, most);
    }
}