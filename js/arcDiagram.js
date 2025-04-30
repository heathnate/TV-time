class arcDiagram {
    constructor(_data, _config) {
        this.data = _data;
        this.config = _config;
        this.initVis();
    }
    
    initVis() {
        let vis = this;

        // create a matrix
        var matrix = [
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            ];

        function pro(dex, bapple)
        {
            let index = 20;
            if(dex == "Burt")
            {
                index = 0;
            }
            else if(dex == "Cobel")
            {
                index = 1;
            }
            else if(dex == "Devon")
            {
                index = 2;
            }
            else if(dex == "Dylan")
            {
                index = 3;
            }
            else if(dex == "Helly")
            {
                index = 4;
            }
            else if(dex == "Irving")
            {
                index = 5;
            }
            else if(dex == "Mark")
            {
                index = 6;
            }
            else if(dex == "Milchick")
            {
                index = 7;
            }
            else if(dex == "Reghabi")
            {
                index = 8;
            }
            else if(dex == "Ricken")
            {
                index = 9;
            }
            if(index != 20)
            {
                if(bapple == "Burt")
                {
                    matrix[index][0] += 1;
                }
                else if(bapple == "Cobel")
                {
                    matrix[index][1] += 1;
                }
                else if(bapple == "Devon")
                {
                    matrix[index][2] += 1;
                }
                else if(bapple == "Dylan")
                {
                    matrix[index][3] += 1;
                }
                else if(bapple == "Helly")
                {
                    matrix[index][4] += 1;
                }
                else if(bapple == "Irving")
                {
                    matrix[index][5] += 1;
                }
                else if(bapple == "Mark")
                {
                    matrix[index][6] += 1;
                }
                else if(bapple == "Milchick")
                {
                    matrix[index][7] += 1;
                }
                else if(bapple == "Reghabi")
                {
                    matrix[index][8] += 1;
                }
                else if(bapple == "Ricken")
                {
                    matrix[index][9] += 1;
                }
            }
        }

        vis.data.forEach(row => {
          if(row['Season'] ==  1)
          {
            pro(row['Character'],row['TalkingTo']);
          }
        });

        // set the dimensions and margins of the graph
        var margin = {top: 20, right: 30, bottom: 20, left: 30},
        width = 450 - margin.left - margin.right,
        height = 300 - margin.top - margin.bottom;

        // create the svg area
        vis.svg = d3.select("#arc")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(150,150)")

        vis.updateVis(matrix);
    }
    updateVis(matrix)
    {
        let vis = this;

        console.log(matrix);

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
    
    // Update the data based on season
    updateSea(dat) {
        let vis = this;

        // create a matrix
        var matrix = [
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            ];

        function pro(dex, bapple)
        {
            let index = 20;
            if(dex == "Burt")
            {
                index = 0;
            }
            else if(dex == "Cobel")
            {
                index = 1;
            }
            else if(dex == "Devon")
            {
                index = 2;
            }
            else if(dex == "Dylan")
            {
                index = 3;
            }
            else if(dex == "Helly")
            {
                index = 4;
            }
            else if(dex == "Irving")
            {
                index = 5;
            }
            else if(dex == "Mark")
            {
                index = 6;
            }
            else if(dex == "Milchick")
            {
                index = 7;
            }
            else if(dex == "Reghabi")
            {
                index = 8;
            }
            else if(dex == "Ricken")
            {
                index = 9;
            }
            if(index != 20)
            {
                if(bapple == "Burt")
                {
                    matrix[index][0] += 1;
                }
                else if(bapple == "Cobel")
                {
                    matrix[index][1] += 1;
                }
                else if(bapple == "Devon")
                {
                    matrix[index][2] += 1;
                }
                else if(bapple == "Dylan")
                {
                    matrix[index][3] += 1;
                }
                else if(bapple == "Helly")
                {
                    matrix[index][4] += 1;
                }
                else if(bapple == "Irving")
                {
                    matrix[index][5] += 1;
                }
                else if(bapple == "Mark")
                {
                    matrix[index][6] += 1;
                }
                else if(bapple == "Milchick")
                {
                    matrix[index][7] += 1;
                }
                else if(bapple == "Reghabi")
                {
                    matrix[index][8] += 1;
                }
                else if(bapple == "Ricken")
                {
                    matrix[index][9] += 1;
                }
            }
        }

        var sea;
        var season = document.getElementById("bes").value;

        if (season == 'all') {
            sea = 0;
        } else if (season == 'season1') {
            sea = 1;
        } else if (season == 'season2') {
            sea = 2;
        }
        console.log(dat);
        dat.forEach(row => {
          if(row['Season'] == sea || sea == 0)
          {
            pro(row['Character'],row['TalkingTo']);
          }
        });
        vis.updateVis(matrix);
    }
}