var svgWidth = 1000;
var svgHeight = 600;

var margin = {
  top:20,
  right: 80,
  bottom: 150,
  left: 100
};
var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis="healthcare";
// function used for updating x-scale var upon click on axis label
function xScale(censusdata, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(censusdata, d => d[chosenXAxis])*0.8,
      d3.max(censusdata, d => d[chosenXAxis])*1.2
    ])
    .range([0, width]);

  return xLinearScale;

}
//function for updating y-scale
function yScale(censusdata, chosenYAxis) {
    // create scales
    var yLinearScale = d3.scaleLinear()
      .domain([d3.min(censusdata, d => d[chosenYAxis])*0.8,
        d3.max(censusdata, d => d[chosenYAxis])*1.2
      ])
      .range([height,0]);
  
    return yLinearScale;
  }
// function used for updating xAxis var upon click on axis label
function renderAxesx(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

 // function used for updating yAxis var upon click on axis label
function renderAxesy(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);
  
    yAxis.transition()
      .duration(1000)
      .call(leftAxis);
  
    return yAxis;
  } 
// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale,chosenXAxis,newYScale,chosenYAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    .attr("cy",d => newYScale(d[chosenYAxis]));

  return circlesGroup;
}
//updating labels on the circles
function renderText(textGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

    textGroup.transition()
        .duration(1000)
        .attr("x", d => newXScale(d[chosenXAxis]))
        .attr("y", d => newYScale(d[chosenYAxis]));

    return textGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis ,circlesGroup) {
    //x-label
  if (chosenXAxis === "poverty" ) {
    var xlabel = "Poverty:";
  }
  else if(chosenXAxis==="age"){
      var xlabel="Median Age:";
  }
  else {
    var xlabel = "Mediam Household Income";
  }
  //y-label
  if (chosenYAxis === "healthcare" ) {
    var ylabel = "Low Healthcare:";
  }
  else if(chosenYAxis==="obesity"){
      var ylabel="Obesity:";
  }
  else {
    var ylabel = "Smokers:";
  }
  var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([80, -60])
    .html(function(d) {
      return (`${d.state}<br>${xlabel} ${d[chosenXAxis],chosenXAxis}<br>${ylabel} ${d[chosenYAxis],chosenYAxis}%`);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover",(d,i,n)=> toolTip.show(d,n[i]))
  
    // onmouseout event
    .on("mouseout", function(censusdata, index) {
      toolTip.hide(censusdata);
    });

  return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
d3.csv("./assets/data/data.csv").then( function(censusdata) {
  
  
  // parse data
  censusdata.forEach(function(data) {
    data.poverty = +data.poverty;
    data.age = +data.age;
    data.income = +data.income;
    data.healthcare = +data.healthcare;
    data.obesity = +data.obesity;
    data.smokes = +data.smokes;
  });

  // xLinearScale function above csv import
  var xLinearScale = xScale(censusdata, chosenXAxis);
  var yLinearScale = yScale(censusdata, chosenYAxis);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    //.attr("transform", `translate(0, ${height})`)
    .attr("transform","translate(" + margin.left + "," + (height + margin.top) + ")")
    .call(bottomAxis);

  // append y axis
  var yAxis = chartGroup.append("g")
    .classed("y-axis", true)
    //.attr("transform", `translate(0, ${height})`)
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    .call(leftAxis);

  // append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(censusdata)
    .enter()
    .append("circle")
    .classed("stateCircle",true)
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 15)
    .attr("fill", "blue")
    .attr("opacity", ".75");

    //append text
    var textGroup = chartGroup.selectAll(".stateText")
    .data(censusdata)
    .enter()
    .append("text")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("font-size", "10px")
    .attr("dy", 3)
    .text(function(d){return d.abbr});

  // Create group for  3 x- axis labels
  var xlabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 55})`);

  var povertyLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .text("In Poverty(%)");

  var ageLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age") // value to grab for event listener
    .classed("inactive", true)
    .text("Age(Median)");
  
    var incomeLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "income") // value to grab for event listener
    .classed("inactive", true)
    .text("Household Income (Median)");

var ylabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${0 - margin.left/15}, ${height/2})`);

    var healthLabel = ylabelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", 0)
    .attr("y", 0-20)
    .attr("dy", "1em")
    .attr("value", "healthcare") // value to grab for event listener
    .classed("inactive", true)
    .text("Lacks Healthcare(%)"); 

    var smokeLabel = ylabelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", 0)
    .attr("y", 0-40)
    .attr("dy", "1em")
    .attr("value", "smokes") // value to grab for event listener
    .classed("inactive", true)
    .text("Smokes (%)"); 
    
    var obeseLabel = ylabelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", 0)
    .attr("y", 0-60)
    .attr("dy", "1em")
    .attr("value", "obesity") // value to grab for event listener
    .classed("inactive", true)
    .text("Obese(%)"); 

  // updateToolTip function above csv import
  var circlesGroup = updateToolTip(chosenXAxis,chosenXAxis, circlesGroup);

  // x axis labels event listener
  xlabelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {
        // replaces chosenXAxis with value
        chosenXAxis = value;
        console.log(chosenXAxis)
        xLinearScale = xScale(censusdata, chosenXAxis);
        xAxis = renderAxesx(xLinearScale, xAxis);
        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup,xLinearScale,chosenXAxis,yLinearScale,chosenYAxis);
        textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis,chosenYAxis, circlesGroup);

        // changes classes to change bold text
        if (chosenXAxis === "poverty") {
            povertyLabel
                .classed("active", true)
                .classed("inactive", false);
            ageLabel
                .classed("active", false)
                .classed("inactive", true);
            incomeLabel
                .classed("active", false)
                .classed("inactive", true);
        }
        else if (chosenXAxis === "age") {
            povertyLabel
              .classed("active", false)
              .classed("inactive", true);
            ageLabel
              .classed("active", true)
              .classed("inactive", false);
            incomeLabel
              .classed("active", false)
              .classed("inactive", true);
      }
        else{
            povertyLabel
            .classed("active", false)
            .classed("inactive", true);
            ageLabel
            .classed("active", false)
            .classed("inactive", true);
            incomeLabel
            .classed("active", true)
            .classed("inactive", false);
        }
    }
});
  ylabelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenYAxis) {
     // replaces chosenYAxis with value
        chosenYAxis = value;
        console.log(chosenYAxis)
        yLinearScale = yScale(censusdata,chosenYAxis);
        yAxis = renderAxesy(yLinearScale,yAxis);
        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup,xLinearScale,chosenXAxis,yLinearScale,chosenYAxis);
        textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis,chosenYAxis, circlesGroup);

        // changes classes to change bold text
        if (chosenYAxis === "obesity") {
            obeseLabel
                .classed("active", true)
                .classed("inactive", false);
            smokeLabel
                .classed("active", false)
                .classed("inactive", true);
            healthLabel
                .classed("active", false)
                .classed("inactive", true);
        }
        else if (chosenYAxis === "smokes") {
            obeseLabel
              .classed("active", false)
              .classed("inactive", true);
              smokeLabel
              .classed("active", true)
              .classed("inactive", false);
              healthLabel
              .classed("active", false)
              .classed("inactive", true);
      }
        else{
            obeseLabel
            .classed("active", false)
            .classed("inactive", true);
            smokeLabel
            .classed("active", false)
            .classed("inactive", true);
            healthLabel
            .classed("active", true)
            .classed("inactive", false);
        }
    }
});

})
  .catch(function(error){
    console.log(error)
  });

