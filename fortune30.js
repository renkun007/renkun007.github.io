//set margin
const margin = { top: 50, right: 150, bottom: 120, left:100};

//define chart properties
const width = "1600";
const height = "800";
const charheight = height- margin.top - margin.bottom;
const charwidth = width - margin.left - margin.right;

//select svg
const svg = d3.select("#FortuneViz")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

//append group on svg
const g = svg.append("g")
    .attr("id","chartgroup")
    .attr("transform", "translate(" + margin.left + ", " + margin.top + ")") 

//initialize X axis
const xscale = d3.scaleBand()
        .range([0,charwidth])
        .padding(0.2); 
const xAxis = d3.axisBottom(xscale); 

const xAxisG = g.append("g")
    .attr("id","xAxisgroup")
    .attr("transform","translate(" + 0 + ", " + charheight + ")");


//initialize Y axis
const yscale = d3.scaleLinear()     
.range([charheight,0]);

//customized format for y axis value
const yAxisTickFormat = number => 
    d3.format(".3s")(number)
    .replace("G", "B");

const yAxis = d3.axisLeft(yscale)
    .ticks(5)
    .tickSize(-charwidth,0,0)
    .tickFormat(yAxisTickFormat);

const yAxisG = g.append("g") 
    .attr("id","yAxisgroup") 
    .attr("transform","translate(" + 0 + ", " + 0+ ")"); 

//add y axis label text
const yLabel = yAxisG.append("text")
    .attr("class","yAxis-label")
    .attr("fill","black")
    .attr("transform","translate(" + -50 + ", " + (charheight - margin.top)/2 + ") rotate(-90)");
//create bar group
const bars = g.append("g")
    .attr("id","bargroup");

//add text title
// g.append("text")
//     .attr("x", charwidth / 2 -200)
//     .text("Top 50 Fortune companies in 2020 by revenue");

// ----------------
// Create a tooltip
// ----------------
const tooltip = d3.select("#FortuneViz")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style('position', 'absolute')
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "1px")
    .style("border-radius", "5px")
    .style("padding", "10px");

const legendKeys = ["Retailing", 
"Energy",
"Technology",
"Health Care",
"Financials", 
"Food & Drug Stores",
"Motor Vehicles & Parts",
"Telecommunications"];


const legendColor = d3.scaleOrdinal()
    .domain(legendKeys)
    .range(d3.schemeCategory10);
const size = 5
// initiate legend group
const legend = g.selectAll()
    .data(legendKeys)
    .enter()
    .append("g")
    .attr("id","legendG")
    .attr("transform","translate(" + charwidth + ", " + charheight/2 + ")");

//function update bar based on selected variable
function update(selectedVar) {
    
    d3.selectAll("rect")
        .remove();
    //load csv
    const data = d3.csv("data.csv").then( function(data) { 
    data.forEach(d => {
        d.revenue = +d.revenue * 1000000;
        d.Market_Cap = +d.Market_Cap * 1000000;
        d.profit = +d.profit * 1000000;
        d.employees_nums = +(d.employees_nums);
        d.rank = +(d.rank);
        d.prev_rank = +(d.prev_rank);

        
    });

    //x value
    const xvalue = d => d.company;
    
    //y value
    const yvalue = d => d[selectedVar];
    // const yvalue = d =>revenue;
    
    const state = d => d.state;

    const topProfit = d3.max(data, d => d.profit);
    
    const topRank = d3.max(data, d => d.rank);

    const topMarketCap = d3.max(data, d => d.Market_Cap);

    const ymax = d3.max(data, d => +d[selectedVar]);

    const ymin = d3.max(data, d => +d[selectedVar]);
        
    //define x and y domain
    xscale.domain(data.map(xvalue));
    
    yscale.domain([0,ymax]);
    //update X and Y axis
    xAxisG.transition()
    .duration(1000)
    .call(xAxis)
    .selectAll("text")
    .attr("transform", "translate(-10,0)rotate(-45)")// X axis tick text rotate 45
    .style("text-anchor", "end")
    
    xAxisG.selectAll(".domain, .tick line") //remove domain line and tick line
    .remove();
    
    yAxisG.transition()
    .duration(1000)
    .call(yAxis);
    yAxisG.selectAll(".domain") //remove Y axis domain line
    .remove();
    
    //update y label
    var ylabeltext;
    if (selectedVar == "revenue"){
        ylabeltext = "Revenue";
    } else if (selectedVar == "Market_Cap"){
        ylabeltext = "Market Cap";
    } else if (selectedVar == "profit"){
        ylabeltext = 'Profit';
    }
    yLabel.text(ylabeltext + " in USD");

    //Mouseover, mousemove and mouseleave functions
    const mouseover = function(event, d) {
        tooltip
            .html(
            `<b>Company: </b>${d.company}
            <br>
            <b>Rank: </b>${d.rank}            
            <br>
            <b>Industry: </b>${d.sector} 
            <br>
            <b>Location: </b>${d.city + ", " + d.state} 
            <br>
            <b>CEO: </b>${d.CEO}
            <br>
            <b>Employee: </b>${yAxisTickFormat(d.employees_nums)}
            <br>
            <b>Revenues (USD): </b>${yAxisTickFormat(d.revenue)}
            <br>
            <b>Market Cap (USD): </b>${yAxisTickFormat(d.Market_Cap)}
            <br>
            <b>Profits (USD): </b>${yAxisTickFormat(d.profit)}`
        )
            .style("opacity", 1);
            
            //hide current bar text
            d3.selectAll("#bartextG")
                .attr('opacity', 0);
            
            d3.select(this).attr('class', 'highlight');
            d3.select(this)
            .transition()     // adds animation
            .duration(400)
            .attr("x", d => xscale(xvalue(d)) - 5)
            .attr('width', xscale.bandwidth() + 10)          

            const ylocation = yscale(yvalue(d));
            const ycurrent = yvalue(d);

            g.append("line")
                .attr("class","dline")
                .attr("id","dline")
                .attr('x1', 0)
                .attr('y1', ylocation)
                .attr('x2', charwidth)
                .attr('y2', ylocation);
            
            g.selectAll()
                .data(data)
                .enter()
                .append("g")
                .attr('class', 'difftext')
                .append('text')
                .attr('class', 'diff')
                .attr('x', d => xscale(xvalue(d)) + xscale.bandwidth()/2)
                .attr('y', d => yscale(yvalue(d)) - 5)
                .attr('fill', 'white')
                .attr('text-anchor', 'middle')
                .text(
                    (a, idx) => {
                  const divergence = (yvalue(a) * 100 /ycurrent - 100).toFixed(1)
                
                  let text = ''
                  if (divergence > 0) text += '+'
                  text += `${divergence}%`
        
                  return text;
                }
                );
      }
    const mousemove = function(event, d) {
        tooltip
            .style("transform","translate(15%,-100%)")
            .style("left",(event.x)+"px")
            .style("top",(event.y)+"px");

      }
    const mouseleave = function(event, d) {
        tooltip
            .style("opacity", 0);
        d3.select(this).attr('class', 'bar');
        d3.select(this)
            .transition()     // adds animation
            .duration(400)
            .attr("x",d => xscale(xvalue(d)))
            .attr('width', xscale.bandwidth())
            .attr("y", function(d) { return yscale(yvalue(d)); })
            .attr("height", function(d) { return charheight - yscale(yvalue(d));
            });
        
        //display current bar text
        d3.selectAll("#bartextG")
            .attr('opacity', 1);
        g.selectAll("#dline").remove();
        g.selectAll(".difftext").remove();
      }


    // clear legend rect and text
    g.selectAll("#legendG")
        .selectAll("rect")
        .remove();
    g.selectAll("#legendG")
        .selectAll("text")
        .remove();

    //plot/update bars on x axis
    const barplot = bars.selectAll("rect")
        .data(data)
        .join("rect")    
        // .enter()
        // .append("rect")
        .attr("class","bar")
        .attr("fill",d=>legendColor(d.sector))
        .attr("x",d => xscale(xvalue(d)))
        .attr("y", d => yscale(0))//animation
        .attr("width",xscale.bandwidth())
        .attr("height", d => charheight - yscale(0)) // animation always equal to 0
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave)
        ; 
    
    //draw legend
    legend.append("circle")
    .attr("class","legendcirle")
    .attr("cx", 10)
    .attr("cy", function(d,i){ return 10 + i*(size+15)}) 
    .attr("r",size)
    // .attr("width", size)
    // .attr("height", size)
    .style("fill", function(d){ return legendColor(d)});

    legend.append("text")
    .attr("class","legendtext")
    .attr("x", 10 + size*1.2)
    .attr("y", function(d,i){ return 10 + i*(size+15) + (size/2)}) 
    .style("fill", function(d){ return legendColor(d)})
    .text(function(d){ return d})
    .attr("text-anchor", "left")
    .style("alignment-baseline", "middle")
    
    //animation
    g.selectAll("rect")
        .transition()
        .duration(1000)
        .attr("y", d => yscale(yvalue(d)))
        .attr("height", d => charheight - yscale(yvalue(d)));
        // .delay((d,i) => {console.log(i); return i*100});//add dealy to each bar
    
         //clear bar text
    g.selectAll("#bartextG")
        .remove();


    //append text to bars
    g.selectAll()
        .data(data)
        .enter()
        .append("g")
        .attr("id","bartextG")
        .append("text")
        // .transition()
        // .duration(1000)
        .attr("class","value")
        .attr("x",d => xscale(xvalue(d)) + xscale.bandwidth() / 2)
        .attr("y",d => yscale(yvalue(d)) -5)
        .attr("text-anchor", "middle")
        .text(d =>yAxisTickFormat(yvalue(d))); 
        
    //annotation
    const annotations = [
        {
            note:{label: "Top Rank"

            },
            subject:{
                y1: -5,
                y2: 0.2 * charheight
            },
            data:{x:"Walmart"},
            y: -10
        },
        {
            note:{label: "Top Market Cap"

            },
            subject:{
                y1: -5,
                y2: 0.2 * charheight
            },
            data:{x:"Apple"},
            y: -10
        },
        {
            note:{label: "Top Profit"

            },
            subject:{
                y1: -5,
                y2: 0.2 * charheight
            },
            data:{x:"Berkshire Hathaway", y:50},
            y: -10
        },
        ];
    const type = d3.annotationCustomType(
        d3.annotationXYThreshold, 
        {"note":{
            "lineType":"none",
            "orientation": "top",
            "align":"middle"}
        }
        )
    // define annotation
    const makeAnnotations = d3.annotation()
        // .editMode(true)
        .type(type)
        .accessors({ 
        x: function(d){ return xscale(d.x) + xscale.bandwidth() / 2}
        // y: function(d){ return yscale(d.y)}
    })
        .annotations(annotations);
    //clear annotation
    d3.selectAll("#annotationG")
        .remove();

    //creat annotation group
    const anno = g.append("g")
    .attr("id","annotationG")
    .attr("class","annotation");


    // call annotation
    anno.call(makeAnnotations);

    })

}



// Initialize plot
update('revenue');
   
