class arcDiagram {
    constructor(_data, _config) {
        this.data = _data;
        this.config = _config;
        this.initVis();
    }
    
    initVis() {
        let vis = this;

        let a = [];
        let b = [];
        let c = [];
        let i = 0;
        let truth = 0;
        let k = 0;
        let arcDiagramData = [];
        vis.data.forEach(row => {
          if(row['Season'] ==  1)
          {
            truth = 0;
            for(let j = 0; j < a.length; j++)
            {
                if(a[j] == row['Character'])
                {
                    truth = 1;
                }
            }
            if(truth == 0)
            {
                a[k] = row['Character'];
                k++;
            }
            b[i] = row['Character'];
            c[i] = row['TalkingTo'];
            i++;
          }
        });
        const nodes = a.map((element, index) => ({
            id: element,
            group: index
        }));
        const processb = b.map((element) => ({
          source: element
        }));
        const processc = c.map((element) => ({
          target: element
        }));
        for(let j = 0; j < processb.length; j++)
        {
          arcDiagramData[j] = [processb[j], processc[j]];
        }
        console.log(nodes);
        console.log(arcDiagramData)
        

        // set the dimensions and margins of the graph
        var margin = {top: 20, right: 30, bottom: 20, left: 30},
        width = 450 - margin.left - margin.right,
        height = 300 - margin.top - margin.bottom;

        // create the svg area
        vis.svg = d3.select("#top-right")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(150,150)")

        // create a matrix
        var matrix = [
        [0,  5871, 8916, 2868, 10],
        [ 1951, 0, 2060, 6171, 10],
        [ 8010, 16145, 0, 8045, 10],
        [ 1013,   990,  940, 0, 10],
        [ 500, 500, 500, 500, 0]
        ];

        // 4 groups, so create a vector of 4 colors
        var colors = [ "#680000", "#ac0000", "#c85b00", "#f98517", "#008c5c", "#33b983", "#002f64", "#0050ae", "#9b54f3", "#bf8cfc"]

        // give this matrix to d3.chord(): it will calculates all the info we need to draw arc and ribbon
        var res = d3.chord()
        .padAngle(0.05)
        .sortSubgroups(d3.descending)
        (matrix)

        // add the groups on the outer part of the circle
        vis.svg
        .datum(res)
        .append("g")
        .selectAll("g")
        .data(function(d) { return d.groups; })
        .enter()
        .append("g")
        .append("path")
        .style("fill", function(d,i){ return colors[i] })
        .style("stroke", "black")
        .attr("d", d3.arc()
            .innerRadius(100)
            .outerRadius(110)
        )

        // Add the links between groups
        vis.svg
        .datum(res)
        .append("g")
        .selectAll("path")
        .data(function(d) { return d; })
        .enter()
        .append("path")
        .attr("d", d3.ribbon()
            .radius(100)
        )
        .style("fill", function(d){ return(colors[d.source.index]) }) // colors depend on the source group. Change to target otherwise.
        .style("stroke", "black");
    }
}