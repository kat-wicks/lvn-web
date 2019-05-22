
const height =Math.min(window.innerHeight/2.2, 500);
const width =Math.min(window.innerWidth/2.5, 700);
const margin = ({top: 20, right: 20, bottom: 20, left: 30});
//let conversation = document.getElementById("conversation").value;
//let conversation = "21";
var wer_data;
var scatter_data;
var x;
var y;
var xAxis;
var yAxis;
var xScale;
var yScale;
var lineGenerator;
var data;

function render(conversation){
  d3.selectAll("svg").remove();
  document.getElementById("speakerClips").innerHTML = "";

const d = (d3.json("updated_data.json")).then(function(da){
    console.log(da)
    console.log(conversation)
    console.log(da[conversation]);

    wer_data =da[conversation];
scatter_data = function(){
        let scatter_points =[]
        for (let person in wer_data.diarized_error_mean){
          scatter_points.push( {"person": person, "mean": wer_data.diarized_error_mean[person], "std": wer_data.diarized_error_std[person]});
        }
        return scatter_points
      }();
x = d3.scaleLinear()
      .domain([0,d3.max(scatter_data, function(d) { return d.mean; })])
      .range([margin.left,width - margin.right]);

y = d3.scaleLinear()
      .domain([0, d3.max(scatter_data, function(d) { return d.std; })])
      .range([height - margin.bottom, margin.top]);
xAxis = d3.axisBottom(x);
yAxis = d3.axisLeft(y);

xScale = d3.scaleLinear()
        .domain([0, wer_data.wer_graph.length])
         .range([margin.left,width - margin.right]);

yScale = d3.scaleLinear()
        .domain([0, 1])  // Input
        .range([height - margin.bottom, margin.top]);
lineGenerator = d3.line()
        .x((d,i) => xScale(i*20))
        .y(d => yScale(d))
        .curve(d3.curveBasis)
data = function() {
        const d = []
        for(let i =0;i<wer_data.wer_graph.length;i=i+20){
          let average =0;
            for(let j =0;j<20;j++){
              average+=wer_data.wer_graph[i+j]
            }
          d.push(average/20);
        }
            return d;
        };


fillScale = d3.scaleSequential(d3.interpolatePuRd);

tooltip = d3.select("body")
      .append("div")
      .style("position", "absolute")
      .style("z-index", "1")
      .style("visibility", "hidden")
      .style("background","white")
      .style("opacity","0.6")
      .style("padding","5px")
      .style("font-family", "'Open Sans', sans-serif")
      .style("font-size", "12px"); 

function generateClipBar(conversation, clips) {
  const bar = document.getElementById('speakerClips');
  bar.className = 'bar';
  for(speaker in clips){
    clipButton = document.createElement('a');
     clipButton.innerHTML = speaker;
    clipButton.className = 'big-button'
   
    clipButton.setAttribute('href',"https://app.lvn.org/conversation/" +conversation+"?t="+Math.round(clips[speaker]).toString());
    bar.appendChild(clipButton);
  }
  return bar;
}

function addWERGraph() {
  const svg = d3.select("#werGraph")
            .append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom);

        svg.append("linearGradient")
            .attr("id", "error-gradient")
            .attr("gradientUnits", "userSpaceOnUse")
            .attr("x1", 0).attr("y1", y(0.04))
            .attr("x2", 0).attr("y2", y(0.76))
          .selectAll("stop")
            .data([
              {offset: "0%", color:"#f794ea"},
              {offset: "80%", color: "#e83a13"}
            ])
          .enter().append("stop")
            .attr("offset", function(d) { return d.offset; })
            .attr("stop-color", function(d) { return d.color; });
         // Standard Margin Convention
        // const g = svg.append("g")
        //     .attr('transform', `translate(${margin.left}, ${margin.top})`)
        
        //   svg.append('g')
        //   .attr('transform', `translate(${margin.left}, ${height - margin.bottom})`)
        //   .call(d3.axisBottom(xScale));
        //   svg.append('g')
        //       .attr('transform', `translate(${margin.left}, 0)`)
        //       .call(d3.axisLeft(yScale));

        svg.append('g')
            .attr('transform', `translate(0, ${height - margin.bottom})`)
            .call(d3.axisBottom(xScale));
        svg.append('g')
            .attr('transform', `translate(${margin.left}, 0)`)
            .call(d3.axisLeft(yScale));
        // // Call the x axis in a group tag
        // g.append("g")
        //     .attr("transform", "translate(0," + height + ")")
        //     .call(); // Create an axis component with d3.axisBottom

        // // Call the y axis in a group tag
        // g.append("g")
        //     .call(); // Create an axis component with d3.axisLeft
        
        // Append the path, bind the data, and call the line generator 
        svg.append('g').append("path")
            .datum(data) // Binds data to the line 
            .attr("d", lineGenerator)
          .style('stroke',"url(#error-gradient)")
            .style("stroke-width", 1)
            .style("fill", "none")
      const curtain = svg.append('rect')
       .attr('x', -1 * ( width+margin.left+25))
       .attr('y', -1 * (height-margin.bottom))
       .attr('height', height-margin.bottom)
       .attr('width', width+9+margin.left)
       .attr('transform', 'rotate(180)')
       .style('fill', '#fff')
        .transition()
      .ease(d3.easeLinear)
       .duration(3000)
       .attr("x", -2 *(width+9+margin.left))
        return svg.node();

}



function addSpeakerGraph(scatter_data) {
 const svg = d3.select('#speakerGraph')
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

  svg.append('g')
      .attr('transform', `translate(0, ${height - margin.bottom})`)
      .call(xAxis);
  svg.append('g')
      .attr('transform', `translate(${margin.left}, 0)`)
      .call(yAxis);
  tooltip;
    
  svg.append("g")
        .attr("stroke", "#000")
        .attr("stroke-opacity", 0.2)
      .selectAll("circle")
      .data(scatter_data)
      .enter()
      .append("circle")
      .attr('fill', d =>fillScale(5*d.mean))
      .attr("cx", d => x(d.mean))
      .attr("cy", d => y(d.std))
      .on("mouseover", d => tooltip.style("visibility", "visible").text(d.person + ": (" + d.mean + "," + d.std +")"))
    .on("mousemove", d => tooltip.style("top", (d3.event.pageY-10)+"px").style("left",(d3.event.pageX+10)+"px").text(d.person + ": (" +d.mean.toFixed(4) + "," +d.std.toFixed(4) +")"))
    .on("mouseout", d => tooltip.style("visibility", "hidden"))
      .transition()
        .delay(function(d,i){return(i*100)})
        .duration(3000)
        .attr("r", 7)
        .attr('opacity', 0.8);
  return svg.node();
}


    generateClipBar(conversation, wer_data.clips);
    addWERGraph();
    addSpeakerGraph(scatter_data);



});

}


render("42");
let input = document.getElementById('conversation-button');
input.addEventListener('click', function(){

    let conversation = document.getElementById('conversation').value;
    render(conversation);
});




