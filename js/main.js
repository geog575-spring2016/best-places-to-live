// (function(){
window.onload = setPage();
          //pseudo-global variables

function setPage() {
    //set variable to use queue.js to parallelize asynchronous data loading
    var q = d3_queue.queue();
    //use queue to retrieve data from all files
    q
        .defer(d3.json, "data/US.topojson")//load states
        .defer(d3.json, "data/Cities.topojson")
        .defer(d3.csv, "data/Attributes.csv")
        .await(callback);

    //function called once data has been retrieved from all .defer lines
    function callback(error, statesData, citiesData, attData){
        // console.log(statesData);
        // console.log(citiesData);
        // console.log(attData);
        //convert topojsons into geojson objects
        var states = topojson.feature(statesData, statesData.objects.US).features;


        createAttPanel(attData);

    }
};

function createAttPanel(attData) {

    //set measurements for panel
    var attMargin = {top: 20, right: 10, bottom: 20, left: 10},
    attHeight = window.innerHeight, //set height to entire window
    attHeight = attHeight - attMargin.top,
    attWidth = window.innerWidth * 0.25,//width of attSvg
    attWidth = attWidth - attMargin.left - attMargin.right, //width with margins for padding
    pcpWidth = attHeight, pcpHeight = attWidth,
    attSpacing = attHeight / 75 + 2, //vertical spacing for each attribute
    rectWidth = 4, rectHeight1 = 6, rectHeight2 = 11,
    rectHeight3 = 16, rectSpacing = 3;

    // labelWidth = ;


    //empty array to hold attribute labels
    var attLabels = [];

    //push properties from attData into attLabels array
    for (var keys in attData[0]){
        keys = keys.split("_").join(" ") //converts underscores in csv to spaces for display purposes
        attLabels.push(keys);
    };

    //remove data identifiers we don't want displayed in panel
    attLabels.splice(0,3)

    //empty array to hold length of each label
    var labelLength = [];
    //for loop to push all label lengths into array
    for (i=0; i<attLabels.length; i++) {
        var attLength = attLabels[i].length;
        labelLength.push(attLength)
    }
    //identify which label is the longest so we can use that as the width in the transform for creating text elements
    var labelWidth = Math.max.apply(Math, labelLength);

    //create svg for attpanel
    var attSvg = d3.select("body").append("svg")
        .attr("class", "attSvg")
        .attr("width", attWidth)
        .attr("height", attHeight)
      .append("g")
        .attr("transform", "translate(" + attMargin.left + "," + attMargin.top + ")");// adds padding to group element in SVG

    //sets att title
    var attTitle = attSvg.append("text")
        .attr("class", "attTitle")
        .attr("x", attWidth / 5)
        .attr("y", attMargin.top)
        .text("Attributes")

    //creates a group for each rectangle and offsets each by same amount
    var attributes = attSvg.selectAll('.attributes')
        .data(attLabels)
        .enter()
      .append("g")
        .attr("class", "attributes")
        .attr("transform", function(d, i) {
            var height = labelWidth / 2 + attSpacing;
            var offset =  height * attLabels.length * 1.05;
            var horz = -2 * labelWidth; //x value for g translate
            var vert = i * height - offset; //y value for g translate
            return 'translate(' + horz + ',' + vert + ')';
      });

      //adds text to attribute g
      var attText = attributes.append('text')
          .attr("class", "attText")
          .attr("x", attWidth / 3.75)
          .attr("y", attHeight - 10)
          .text(function(d ) { return d });

      //used to place checkbox relative to attText labels
      var textX = d3.select(".attText").attr("x")

      var checkboxes = attributes.append("foreignObject")
          .attr('x', textX - 30)
          .attr('y', attHeight - 25)
          .attr('width', "50px")
          .attr('height', "20px")
          .append("xhtml:body")
          .html("<form><input type=checkbox id='check'</input></form>")

      //define x,y property values for first rectangle
      var x1 = (textX + labelWidth)*3.4
      var y1 = attHeight - 15

      //creates rect elements for weighting attribute
      var attRect1 = attributes.append('rect')
          .attr("class", "attRect1")
          .attr('width', rectWidth)
          .attr('height', rectHeight1)
          .attr("x", x1)
          .attr('y', y1)
      //creates rect elements for weighting attribute
      var attRect2 = attributes.append('rect')
          .attr("class", "attRect2")
          .attr('width', rectWidth)
          .attr('height', rectHeight2)
          .attr("x", x1 + rectSpacing*2)
          .attr('y', y1 - rectHeight1 + 1)
      //creates rect elements for weighting attribute
      var attRect3 = attributes.append('rect')
          .attr("class", "attRect3")
          .attr('width', rectWidth)
          .attr('height', rectHeight3)
          .attr("x", x1 + rectSpacing*4)
          .attr('y', y1 - rectHeight2 + 1)


//pcp code from former lab2 instructions

      // var coordinates = d3.scale.ordinal()
      //     .domain(attLabels)
      //     .rangePoints([pcpHeight, 0])
      //
      // var axis = d3.svg.axis()
      //     .orient("top");
      //
      // scales = {};
      // attLabels.forEach(function(att){
      //     scales[att] = d3.scale.linear()
      //         .domain(d3.extent(attData, function(data) {
      //               return +data[att];
      //               console.log(data[att]);
      //         }))
      //         .range([0, pcpWidth])
      // });
      //
      //
      // var line = d3.svg.line();
      //
      // var pcpSvg = d3.select("body")
      //     .append("svg")
      //     .attr("width", pcpWidth)
      //     .attr("height", pcpHeight)
      //     .attr("class", "pcpSvg")
      //   .append("g")
      //     .attr("transform", d3.transform(
      //         "scale(0.8, 0.6)," + "translate(96, 50)"
      //     ));
      //
      // var pcpBackground = pcpSvg.append("rect")
      //     .attr("x", "-30")
      //     .attr("y", "-35")
      //     .attr("width", pcpWidth + 60)
      //     .attr("height", pcpHeight + 60)
      //     .attr("rx", "15")
      //     .attr("ry", "15")
      //     .attr("class", "pcpBackground");
      //
      // // var pcpLines = pcpSvg.append("g")
      // //     .attr("class", "pcpLines")
      // //     .selectAll("path")
      // //     .data(attData)
      // //     .enter()
      // //     .append("path")
      // //     .attr("id", function(d) {
      // //         return "city" + d.ID
      // //     })
      // //     .attr("d", function(d){
      // //         return line(attLabels.map(function(att){
      // //               return[coordinates(att), scales[att](d[att])];
      // //         }));
      // //     });
      //
      //     var axis = pcpSvg.selectAll(".attribute")
      //         .data(attLabels)
      //         .enter()
      //       .append("g")
      //         .attr("class", "axis")
      //         .attr("transform", function(d){
      //             return "translate(" + coordinates(d) +")";
      //         })
      //         .each(function(d){
      //             d3.select(this)
      //                 .call(axis.scale(scales[d])
      //                     .ticks(0)
      //                     .tickSize(0)
      //               )
      //             .attr("id", d)
      //             .style("stroke-width", "2px")
      //         })



// //code trying to add pcp to att panel groups
//
//       scales = {};
//       attLabels.forEach(function(att){
//           scales[att] = d3.scale.linear()
//               .domain(d3.extent(attData, function(data) {
//                     return +data[att];
//                     console.log(data[att]);
//               }))
//               .range([0, pcpWidth])
//       });
//
//       var attg = attributes.append("g")
//           .attr("class", "attg")
//           .attr("transform", function(d, i){
//                 var height = labelWidth / 2 + attSpacing;
//                 var offset =  height * attLabels.length * 1.05;
//                 var horz = -2 * labelWidth; //x value for g translate
//                 var vert = i * height - offset; //y value for g translate
//                 return 'translate(' + horz + ',' + vert + ')';
//           })
//
//       var axis = attg.append("g")
//           .attr("class", "axis")
//           .attr("x", x1 + rectSpacing*6)
//           .attr("y", y1 - rectHeight2 + 1)
//           .each(function(d){
//               d3.select(this)
//                   .call(axis.scale(scales[d])
//                       .ticks(0)
//                       .tickSize(0)
//                 )
//               .attr("id", d)
//               .style("stroke-width", "2px")
//           })


// pcp code from my lab2

      //filters out properties from each line segment in csvFullData I don't want to display in PCP
      var filteredData = attData.map(function(d) {

          return {
              Bars: d.Bars,
              Bike: d.Bike,
              Farmers_Markets: d.Farmers_Markets,
              Fitness: d.Fitness,
              Food: d.Food,
              LGBTQ_Friendly: d.LGBTQ_Friendly,
              MedianEarningsMonth: d.MedianEarningsMonth,
              MedianRent: d.MedianRent,
              Median_Earnings: d.Median_Earnings,
              Museums: d.Museums,
              Music: d.Music,
              Parks: d.Parks,
              Pet_Friendly: d.Pet_Friendly,
              Price_of_Weed: d.Price_of_Weed,
              Ratio_of_Males_to_Females: d.Ratio_of_Males_to_Females,
              Safety: d.Safety,
              Sports: d.Sports,
              Transit: d.Transit,
              Walk: d.Walk
          }
      });


      //create an SVG container for the PCP
      var pcpSvg = d3.select("body").append("svg")
          .attr("class", "pcpSvg")
          .attr("width", pcpWidth + attMargin.left + attMargin.right)
          .attr("height", pcpHeight + attMargin.top + attMargin.bottom)
        .append("g")
           .attr("transform", "translate(" + attMargin.left + "," + attMargin.top + ")" + "rotate(90, "+ pcpWidth/2 + "," + pcpHeight/2 + ")");// adds padding to group element in SVG



      //construct an ordinal scale for x with rangeoutput of [0, width] as min and max values of output range; 1 is for padding
        var x = d3.scale.ordinal().rangePoints([0, pcpWidth], 1),
            y = {},
            dragging = {};

        var line = d3.svg.line(), //new line generator
            axis = d3.svg.axis().ticks(0).tickSize(0).orient("left") //new axis generator with left orientation

      // Extract the list of dimensions and create a scale for each to set as domain of x.
      x.domain(dimensions = d3.keys(filteredData[0]).filter(function(d) { //.keys returns array of property names for a given object
          //.filter creates new array based on this function
          //i don't understand what this is doing
          return d != "name" && (y[d] = d3.scale.linear()
              //can't figure out what this does either
              .domain(d3.extent(attData, function(p) { return +p[d]; }))//.extent returns min/max of array
              .range([pcpHeight, 0]));
      }));
      // Add grey background lines; these will be displayed when user selects foreground lines
      pcpBackground = pcpSvg.append("g")
          .attr("class", "pcpBackground")
          .selectAll("path")
          .data(attData)
          .enter()
        .append("path")
          .attr("d", path)

      // Add blue foreground lines for focus
      pcpForeground = pcpSvg.append("g")
          .attr("class", "pcpForeground")
        .selectAll("path")
          .data(attData)
          .enter()
        .append("path")
          .attr("id", function(d){
              return "line" + d.ID;
          })
          .attr("d", path)
      // Add a group element for each dimension (i.e., each axis)
      var pcpg = pcpSvg.selectAll(".dimension")
          .data(dimensions)
          .enter()
        .append("g")
          .attr("class", "dimension")
          .attr("transform", function(d) { return "translate(" + x(d) + ")"; })
          .call(d3.behavior.drag() //add ability to reorder axes
              .origin(function(d) { return {x: x(d)}; })
              .on("dragstart", function(d) {
                  dragging[d] = x(d);
                  pcpBackground.attr("visibility", "hidden");
              })
              .on("drag", function(d) {
                  dragging[d] = Math.min(pcpWidth, Math.max(0, d3.event.x));
                  pcpForeground.attr("d", path)
                  dimensions.sort(function(a, b) { return position(a) - position(b); });
                  x.domain(dimensions);
                  pcpg.attr("transform", function(d) { return "translate(" + position(d) + ")"; })
              })
            .on("dragend", function(d) {
                delete dragging[d];
                transition(d3.select(this)).attr("transform", "translate(" + x(d) + ")");
                transition(pcpForeground).attr("d", path);
                //removes background gray lines and lets blue foreground lines show
                pcpBackground
                    .attr("d", path)
                  .transition()
                    .delay(800)
                    .duration(0)
                    .attr("visibility", null);
            })
        );

      // Add an axis and title.
      pcpg.append("g")
          .attr("class", "axis")
          .attr("id", function(d){ return d;})
          .each(function(d) { d3.select(this).call(axis.scale(y[d])); })

      // Add and store a brush for each axis.
      pcpg.append("g")
          .attr("class", "brush")
          .each(function(d) {
              d3.select(this)
              .call(y[d].brush = d3.svg.brush().y(y[d])
                  .on("brushstart", brushstart)
                  .on("brush", brush));
          })
        .selectAll("rect")
          .attr("x", -8)
          .attr("width", 16);

      //position generator for axis dragging
      function position(d) {
          var v = dragging[d];
          return v == null ? x(d) : v;
      };

      //transition generator for pcp
      function transition(g) {
          return pcpg.transition().duration(1500);
      };

      // Returns the path for a given datum
      function path(d) {
          return line(dimensions.map(function(p) { return [position(p), y[p](d[p])]; }));
      }

      //stops other events when brushing begins
      function brushstart() {
          d3.event.sourceEvent.stopPropagation();
      }

      // Handles a brush event, toggling the display of foreground lines.
      function brush() {
          //determines extent of brush to determine which pcp lines are active
          var actives = dimensions.filter(function(p) { return !y[p].brush.empty(); }),
              extents = actives.map(function(p) { return y[p].brush.extent(); });
          pcpForeground.attr("class", function(d) {
              return actives.every(function(p, i) {
                  return extents[i][0] <= d[p] && d[p] <= extents[i][1];
              }) ? null: "hidden";
          });

      };




      // // Add an axis and title.
      // var filterAxis = d3.selectAll(".attributes").append("g")
      //     .attr("class", "axis")
      //     .attr("id", function(d){ return d; })
      //     .each(function(d) { d3.select(this).call(axis.scale(x[d])); })


}
