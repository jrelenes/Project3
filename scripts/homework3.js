
var mapSvg;

var lineSvg;
var lineWidth;
var lineHeight;
var lineInnerHeight;
var lineInnerWidth;
var lineMargin = { top: 20, right: 60, bottom: 60, left: 100 };

var mapData;
var timeData;




// This runs when the page is loaded
document.addEventListener('DOMContentLoaded', function() {
  mapSvg = d3.select('#map');
  lineSvg = d3.select('#linechart');
  lineWidth = +lineSvg.style('width').replace('px','');
  lineHeight = +lineSvg.style('height').replace('px','');;
  lineInnerWidth = lineWidth - lineMargin.left - lineMargin.right;
  lineInnerHeight = lineHeight - lineMargin.top - lineMargin.bottom;

  // Load both files before doing anything else
  Promise.all([d3.json('data/africa.geojson'),
               d3.csv('data/africa_gdp_per_capita.csv')])
          .then(function(values){
    
    mapData = values[0];
    timeData = values[1];

   
    var year = "2000";
    var Color= d3.interpolateRdYlGn;

    drawMap(year, Color);


    d3.select("#year-input").on("change", function(d) {
      var updatedYear = d3.select(this).property("value")

      mapSvg.selectAll("g").remove();

      drawMap(updatedYear, Color);
      
     })


    d3.select("#color-scale-select").on("change", function(d) {
      var ColorString = d3.select(this).property("value")


      if (ColorString == "interpolateRdYlGn") {

           updatedColor = d3.interpolateRdYlGn;
      }
      else if (ColorString == "interpolateViridis") {

           updatedColor = d3.interpolateViridis;

      }
      else if(ColorString == "interpolateBrBG")
      {

           updatedColor = d3.interpolateBrBG;


      }
      else if(ColorString == "interpolateBlues")
      {
             updatedColor = d3.interpolateBlues;

      }
      else if(ColorString == "interpolateGreens")
      {
             updatedColor = d3.interpolateGreens;

      }

      Color = updatedColor;

      mapSvg.selectAll("defs").remove();
      mapSvg.selectAll("g").remove();




      drawMap(year, Color);
     
     })

  })

});

// Get the min/max values for a year and return as an array
// of size=2. You shouldn't need to update this function.
function getExtentsForYear(yearData) {
  var max = Number.MIN_VALUE;
  var min = Number.MAX_VALUE;
  for(var key in yearData) {
    if(key == 'Year') 
      continue;
    let val = +yearData[key];
    if(val > max)
      max = val;
    if(val < min)
      min = val;
  }
  return [min,max];
}

// Draw the map in the #map svg
function drawMap(year, updatedColor) {

  



  console.log(year);

  // create the map projection and geoPath
  let projection = d3.geoMercator()
                      .scale(400)
                      .center(d3.geoCentroid(mapData))
                      .translate([+mapSvg.style('width').replace('px','')/2,
                                  +mapSvg.style('height').replace('px','')/2.3]);
  let path = d3.geoPath()
               .projection(projection);


  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // get the selected year based on the input box's value
  

  //////////////////////////////////create update function year//////////////////////////////////////////////////////
  

  // get the GDP values for countries for the selected year
  let yearData = timeData.filter( d => d.Year == year)[0];
  

  // get the min/max GDP values for the selected year
  let extent = getExtentsForYear(yearData);

  ////////////////////////////////////////create update function color//////////////////////////////////////////////////
  //var color = document.getElementById("color-scale-select");
  //console.log(color.value);

  // get the selected color scale based on the dropdown value
  var colorScale = d3.scaleSequential(updatedColor)
                     .domain(extent);

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  // draw the map on the #map svg
  let g = mapSvg.append('g');
  var tip = d3.tip()
  .attr("class", "d3-tip")
  .style("background-color", 'white')
  .style("color", 'black')
  .offset([55, 95])
  g.call(tip);


  g.selectAll('path')
    .data(mapData.features)
    .enter()
    .append('path')
    .attr('d', path)
    .attr('id', d => { return d.properties.name})
    .attr('class','countrymap')
    .style('fill', d => {
      let val = +yearData[d.properties.name];
      if(isNaN(val)) 
        return 'white';
      return colorScale(val);
    })
    .on('mouseover',function(d,i) {
      //console.log('mouseover on ' + d.properties.name);
      d3.select(this)
            .style('stroke', 'cyan')
            .style('stroke-width', '4');

        // tip.select(".d3-tip")
        // .text("fffffffffffffffffffffffffffff")

        //gdp = timeData.filter( p => p.Year == d.properties.Year)[0];
        //instance = gdp[d.properties.name];
        
        
         gdpvalues = []
         timeData.forEach(function(k) {

             array = timeData.filter( p => p.Year == k.Year)[0];
             gdpvalues.push(array[d.properties.name]);
         })

        gdpMax = d3.max(gdpvalues, function(d) { return d; });

        console.log(gdpMax);
        tip.html("<div>Country: "+d.properties.name+"</div> <div>GDP: "+gdpMax+"</div>");
        tip.show()

             
    })
    .on('mousemove',function(d,i) {
      //console.log('mousemove on ' + d.properties.name);
      d3.select(this)
            .style('stroke', 'cyan')
            .style('stroke-width', '4')
    })
    .on('mouseout',function(d,i) {
      //console.log('mouseout on ' + d.properties.name);
      d3.select(this)
        .style('stroke', 'black')
        .style('stroke-width', '1')

        tip.hide()

    })
    .on('click', function(d,i) {
      //console.log('clicked on ' + d.properties.name);
      //console.log(d.geometry.coordinates);

      //var data = d;
      //console.log(data.features);

      d3.select(this)
            .style('stroke', 'cyan')
            .style('stroke-width', '4')


      lineSvg.selectAll("svg").remove();
      drawLineChart(d.properties.name);

      

        



    });


    ///////////////////////////////////////////////////


  
    

    margin = {top: 20, right: 40, bottom: 30, left: 40};
    width = 265;
    barHeight = 22;
    height = 545 ;
                


    var svg = d3.select("#map");
    var defs = svg.append("defs");






    var axisScale = d3.scaleLinear()
    .domain(colorScale.domain())
    .range([margin.left, width - margin.right]);

    axisBottom = g => g
      .attr("class", `x-axis`)
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(axisScale)
        .ticks(width / 50)
        .tickSize(-barHeight));





    var linearGradient = defs.append("linearGradient")
      .attr("id", "linear-gradient")
      ;

  
    linearGradient.selectAll("stop")
      .data(colorScale.ticks().map((t, i, n) => ({ offset: `${100*i/n.length}%`, color: colorScale(t) })))
      .enter().append("stop")
      .attr("offset", d => d.offset)
      .attr("stop-color", d => d.color)
      ;

    
    svg.append('g')
      .attr("transform", `translate(0,${height - margin.bottom - barHeight})`)
      .append("rect")
      .attr('transform', `translate(${margin.left}, 0)`)
    .attr("width", width - margin.right - margin.left)
    .attr("height", barHeight)
    .style("fill", "url(#linear-gradient)");

    svg.append('g')
    .call(axisBottom);

    ///////////////////////////////////////////////////
    
}


// Draw the line chart in the #linechart svg for
// the country argument (e.g., `Egypt').
function drawLineChart(country) {

  //console.log(countryData)

  Data = [];
  years = [];
  countryValues = [];

  timeData.forEach(function(d) {

      years.push(d.Year);
      array = timeData.filter( p => p.Year == d.Year)[0];
      Data.push({year: d.Year,value: array[country]});
      countryValues.push(array[country]);
    })

    

    // yearValues = timeData.forEach(function(d) {
    //   array = [];
    //   console.log(obj(q))

    //   array.push(d.country);
    //   return array;
    // })





  ////////////////////////////////////////////////

//   var margin = {top: 30, right: 20, bottom: 30, left: 50},
//     width = 600 - margin.left - margin.right,
//     height = 270 - margin.top - margin.bottom;


//     ///////////////////////////////////////////
// //     lineSvg;
// // var lineWidth;
// // var lineHeight;
// // var lineInnerHeight;
// // var lineInnerWidth;
// // var lineMargin = { top: 20, right: 60, bottom: 60, left: 100 };



//     //////////////////////////////////////

//     console.log(country);
// // Parse the date / time

// // Set the ranges
// var x = d3.scaleLinear().range([0, lineInnerWidth]);
// var y = d3.scaleLinear().range([lineInnerHeight, 0]);

// var xRange = d3.scaleTime()
//         .range([0,lineInnerWidth]);

// var xAxis = d3.axisBottom()
//       .scale(x)
//       .tickSize(5);

// var yAxis = d3.axisLeft()
//             .scale(y)
//             .tickSize(5);

// var yAxisGrid = d3.axisLeft(y).tickSize(-lineInnerWidth).tickFormat('').ticks(8);


// //Define the line
// var valueline = d3.line()
//     .x(function(d) { return x(d.year); })
//     .y(function(d) { return y(d.value); });
    
// // Adds the svg canvas
// var svg = d3.select('#linechart')
//     .append("svg")
//         .attr("width", lineInnerWidth + lineMargin.left + lineMargin.right)
//         .attr("height", lineInnerHeight + lineMargin.top + lineMargin.bottom)
//     .append("g")
//         .attr("transform", 
//               "translate(" + lineMargin.left + "," + lineMargin.top + ")");

// var lineSvg = svg.append("g");                             // **********

// var focus = svg.append("g")                                // **********
//     .style("display", "none");  
    
    
//     // svg.append("g")
//     // .attr("class", "y axis")
//     // .call(yAxis);
//     svg.append('g')
//       .attr('class', 'y axis-grid')
//       .style("stroke-dasharray", ("3, 3"))
//       .call(yAxisGrid);



//     svg.append("text")
//     .attr("transform", "rotate(-90)")
//     .attr("y", 35 - lineMargin.left)
//     .attr("x",0 - (lineInnerHeight / 2))
//     .attr("dy", "1em")
//     .style("text-anchor", "middle")
//     .style("font", "20px times")
//     .text("GDP for Ethiopia (Based on current USD)"); 
//   xRange.domain(["1960","2011"]);


//   svg.append("g")
//       .attr("transform", "translate(0," + lineInnerHeight + ")")
//       .call(d3.axisBottom(xRange)
//               .tickFormat(d3.format("d"))
//               .ticks(5));

//   svg.append("text")             
//      .attr("transform",
//               "translate(" + (lineInnerWidth/2) + " ," + 
//                                   (lineInnerHeight + lineMargin.top + 20) + ")")
//               .style("text-anchor", "middle")
//               .style("font", "20px times")
//               .text("Year");

//       svg.selectAll("text")
//           .style("stroke", "grey");

//       svg.selectAll("path")
//           .style("stroke", "grey");


//       svg.selectAll("line")
//         .style("stroke", "grey");

//       //   Data.forEach(function(d) {
//       //     d.date = parseTime(d.date);
//       //     d.close = +d.close;
//       // });

  

//      x.domain(d3.extent(Data, function(d) { return d.Year; }));

//      y.domain([0, d3.max(Data, function(d) { 
//       //console.log(d);
//       return d.value; })])

//       // add the valueline path.
//       svg.append("path")
//         .data([Data])
//         .attr("class", "line")
//         .attr("d",valueline);

      
//       svg.append("g")
//         .attr("transform", "translate(0," + lineInnerHeight + ")")
//         .call(d3.axisBottom(x));
  
      
//       svg.append("g")
//       .call(d3.axisLeft(y));



// parse the date / time

// set the ranges
var x = d3.scaleLinear().range([0, lineInnerWidth]);
var y = d3.scaleLinear().range([lineInnerHeight, 0]);



// define the line
var valueline = d3.line()
    .x(function(d) { return x(d.year); })
    .y(function(d) { return y(d.value); });



// append the svg obgect to the body of the page
// appends a 'group' element to 'svg'
// moves the 'group' element to the top left margin
var svg = d3.select("#linechart").append("svg")
    .attr("width", lineInnerWidth + lineMargin.left + lineMargin.right)
    .attr("height", lineInnerHeight + lineMargin.top + lineMargin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + lineMargin.left + "," + lineMargin.top + ")");



// Get the data

  // format the data
  // Data.forEach(function(d) {
  //     d.year = parseTime(d.year);
  //     d.value = +d.value;
  // });


      svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("class","ytext")
    .attr("y", 35 - lineMargin.left)
    .attr("x",0 - (lineInnerHeight / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .style("font", "20px Arial")
    .text("GDP for "+country+" (Based on current USD)"); 



    svg.append("text")  
     .attr("class","xtext")           
     .attr("transform",
              "translate(" + (lineInnerWidth/2) + " ," + 
                                  (lineInnerHeight + lineMargin.top + 20) + ")")
              .style("text-anchor", "middle")
              .style("font", "20px Arial")
              .text("Year");

    svg.selectAll("text")
           .style("stroke", "grey");

  //////////////////////////////////////

  // Scale the range of the data
  //x.domain(d3.extent(Data, function(d) { return d.year; }));
  x.domain([Data[0].year, Data[Data.length - 1].year]);

  y.domain([0, d3.max(Data, function(d) { return +d.value; })]);
  console.log(Data)



  // Add the valueline path.
  svg.append("path")
      .data([Data])
      .attr("class", "line")
      .attr("d", valueline);

  //Add the x Axis
  svg.append("g")
      .attr("transform", "translate(0," + lineInnerHeight + ")")
      .attr("class","xAxis")
      .call(d3.axisBottom(x)
              .tickFormat(d3.format("d"))
              .ticks(5)
      
      );

  //ticks x axis
  svg.append("g")
      .attr("transform", "translate(0," + lineInnerHeight + ")")
      .attr("class","xAxisTicks")
      .call(d3.axisBottom(x)
              .tickFormat(d3.format("d"))
              .ticks(10)
      
      );
/////////////////////////////////////////////////////////////
      var yAxisGrid = d3.axisLeft(y)
      .tickSize(-lineInnerWidth);
      //.tickFormat('').ticks(5.5);

      svg.append('g')
      .attr('class', 'yaxis-grid')
      .style("stroke-dasharray", ("5, 10"))
      .call(yAxisGrid);

  // Add the y Axis
  // svg.append("g")
  //     .call(d3.axisLeft(y))
  //     .attr("class","yAxis");

      //////////////////////////////////////////////////
      /////////////////////////////////////////////

      bisectDate = d3.bisector(function(d) { return d.year; }).left;

      var focus = svg.append("g")
            .attr("class", "focus")
            .style("display", "none");

        focus.append("circle")
            .attr("r", 10);

        focus.append("rect")
            .attr("class", "tooltip")
            .attr("width", 120)
            .attr("height", 50)
            .attr("x", 10)
            .attr("y", -110)
            .attr("rx", 4)
            .attr("ry", 4);

        focus.append("text")
            .attr("class", "tooltip-year")
            .attr("x", 18)
            .attr("y", -90);

        // focus.append("text")
        //     .attr("x", 18)
        //     .attr("y", 18)
        //     .text("GDP:");

        focus.append("text")
            .attr("class", "tooltip-value")
            .attr("x", 20)
            .attr("y", -70);

        svg.append("rect")
            .attr("class", "overlay")
            .attr("width", lineInnerWidth)
            .attr("height", lineInnerHeight)
            .on("mouseover", function() { focus.style("display", null); })
            .on("mouseout", function() { focus.style("display", "none"); })
            .on("mousemove", mousemove);

        function mousemove() {
            var x0 = x.invert(d3.mouse(this)[0]),
                i = bisectDate(Data, x0, 1),
                d0 = Data[i - 1],
                d1 = Data[i],
                d = x0 - d0.year > d1.year - x0 ? d1 : d0;
            focus.attr("transform", "translate(" + x(d.year) + "," + y(d.value) + ")");
            focus.select(".tooltip-year").text("Year: "+d.year);
            focus.select(".tooltip-value").text("GDP: "+d.value);
        }
  



  if(!country)
    return;
  
}
