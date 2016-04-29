window.onload = setPage();
          //pseudo-global variables

function setPage() {
    //set variable to use queue.js to parallelize asynchronous data loading
    var q = d3_queue.queue();
    //use queue to retrieve data from all files
    q
        .defer(d3.json, "data/US.topojson")//load states
        .defer(d3.json, "data/Cities.topojson")
        .defer(d3.csv, "data/Master.csv")
        .await(callback);
};
//function called once data has been retrieved from all .defer lines
function callback(error, statesData, citiesData, attData){
    // console.log(statesData);
    // console.log(citiesData);
    // console.log(attData);
    //convert topojsons into geojson objects
    var states = topojson.feature(statesData, statesData.objects.US).features;
    var cities = topojson.feature(citiesData, citiesData.objects.collection).features;

    // createDefaultAtts(attData);
    createAttPanel(attData);

    createMap(states, cities);

    var citiesArray = createCityIDObject(attData);

    createCitiesPanel(citiesArray);

}
//function that returns array of objects containing city name and ID; mostly for testing reordering of cities panel until we implement calculation
function createCityIDObject(attData) {

    var citiesArray = [];
    //creates object with city name and ID and pushes them into an array
    attData.map(function(d) { //d is each city object
        var cityObj = {
            City: d.Cities_Included,
            ID: d.ID
        };
        citiesArray.push(cityObj)
    });
    return citiesArray;
};
// function createDefaultAtts(attData) {
//       //empty array to hold attribute labels
//       var attLabels = [];
//
//       //push properties from attData into attLabels array
//       for (var keys in attData[0]){
//           keys = keys.split("_").join(" ") //converts underscores in csv to spaces for display purposes
//           attLabels.push(keys);
//       };
//
//       var defaultAtts = [attLabels[11], attLabels[12], attLabels[3], attLabels[4], attLabels[5], attLabels[6]];
//       // var defaultAtts = attLabels
//       createAttPanel(attData, defaultAtts)
// }

function createAttPanel(attData) {

    //set measurements for panel
    var attMargin = {top: 20, right: 10, bottom: 30, left: 10},
    attHeight = 800, //set height to entire window
    attHeight = attHeight - attMargin.top,
    attWidth = 300,//width of attSvg
    attWidth = attWidth - attMargin.left - attMargin.right, //width with margins for padding
    pcpWidth = attHeight, pcpHeight = attWidth,
    attSpacing = attHeight / 40, //vertical spacing for each attribute
    rectWidth = 4, rectHeight1 = 6, rectHeight2 = 11,
    rectHeight3 = 16, rectSpacing = 3;

    //array to hold all property names
    var allAttributes = [];

    //push property names from attData into allAttributes array
    for (var keys in attData[0]){
        allAttributes.push(keys);
    };
    //create an array with only properties with Raw values; for PCP display
    var rawData = searchStringInArray("Raw", allAttributes);

    //create an array with only properties with Rank values; for calculation
    var rankData = searchStringInArray("Rank", allAttributes);

    var attLabels = removeStringFromEnd("_Rank", rankData)

    attLabels = removeUnderscores(attLabels);

    //empty array to hold length of each label
    var labelLength = [];
    //for loop to push all label lengths into array
    for (i=0; i<rankData.length; i++) {
        var attLength = rankData[i].length;
        labelLength.push(attLength)
    }

    //identify which label is the longest so we can use that as the width in the transform for creating text elements
    var labelWidth = Math.max.apply(Math, labelLength);


    //div container that holds SVG
    var attContainer = d3.select("body").append("div")
        .attr("id", "attContainer")

    //create svg for attpanel
    var attSvg = d3.select("#attContainer").append("svg")
        .attr("class", "attSvg")
        .attr("width", "100%")
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
    var variables = attSvg.selectAll('.variables')
        .data(attLabels)
        .enter()
      .append("g")
        .attr("class", "variables")
        .attr("transform", function(d, i) {
            var height = labelWidth + attSpacing/1.5;
            // console.log(height);
            var offset =  height * attLabels.length;
            // console.log(offset);
            var horz = -labelWidth - 5; //x value for g translate
            // var vert = i * height - offset; //y value for g translate
            var vert = i * height - offset; //y value for g translate
            return 'translate(' + horz + ',' + vert + ')';
      });


      //adds text to attribute g
      var attText = variables.append('text')
          .attr("class", "attText")
          .attr("x", attWidth / 5.8)
          .attr("y", attHeight - 10)
          .text(function(d ) { return d })
          .attr("id", function(d) {
              //put d in array because addUnderscores only takes an array
              var arrayD = [d]
              //add underscores back to labels so they match with object properties
              d = addUnderscores(arrayD);
              //returns attribute label followed by _Rank; this way we can access each attribute by its object property
              return searchStringInArray(d, rankData);
          });

      //used to place checkbox relative to attText labels
      var textX = d3.select(".attText").attr("x")

      var checkboxes = variables.append("foreignObject")
          .attr('x', textX - 25)
          .attr('y', attHeight - 26)
          .attr('width', "20px")
          .attr('height', "20px")
        .append("xhtml:body")
          .html("<form><input type=checkbox id='check'</input></form>")

      //define x,y property values for first rectangle
      var x1 = (textX + labelWidth)*3.9
      var y1 = attHeight - 15

      //creates rect elements for weighting attribute
      var attRect1 = variables.append('rect')
          .attr("class", "attRect")
          .attr('width', rectWidth)
          .attr('height', rectHeight1)
          .attr("x", x1)
          .attr('y', y1)
      //creates rect elements for weighting attribute
      var attRect2 = variables.append('rect')
          .attr("class", "attRect2")
          .attr('width', rectWidth)
          .attr('height', rectHeight2)
          .attr("x", x1 + rectSpacing*2)
          .attr('y', y1 - rectHeight1 + 1)
      //creates rect elements for weighting attribute
      var attRect3 = variables.append('rect')
          .attr("class", "attRect3")
          .attr('width', rectWidth)
          .attr('height', rectHeight3)
          .attr("x", x1 + rectSpacing*4)
          .attr('y', y1 - rectHeight2 + 1)

      //used to place checkbox relative to attText labels
      var rectX = +d3.select(".attRect3").attr("x") + 40

      var sliderValues = variables.append("foreignObject")
          .attr("class", "sliderValues")
          .attr("width", "150px")
          .attr("height", "10px")
          .attr("x", rectX)
          .attr("y", attHeight - 40)
        .append("xhtml:body")
          .html(function(d){
            //call function that turns d from label into object property (e.g., "Pet Friendly" becomes "Pet_Friendly_Rank")
            var attribute = createAttID(d, rankData);
            return "<input type='text' id='" + attribute +"_rankVal' width='40px' height='8px'></input>"})


      var sliderRange = variables.append("foreignObject")
          .attr("class", "sliderRangeFO")
          .attr("id", function(d){
              //call function that turns d from label into object property (e.g., "Pet Friendly" becomes "Pet_Friendly_Rank")
              var attribute = createAttID(d, rankData);
              return attribute + "_FO";
          })
          .attr('width', "150px")
          .attr('height', "20px")
          .attr("x", rectX - 20)
          // .style("y", 500)
        .append("xhtml:div")
          .attr("class", "sliderRange")
          .attr("id", function(d){
              //call function that turns d from label into object property (e.g., "Pet Friendly" becomes "Pet_Friendly_Rank")
              var attribute = createAttID(d, rankData);

              return attribute + "-slider-range";
          })
          // .style("height", "20px")
          .each(function(d){
              //call function that turns d from label into object property (e.g., "Pet Friendly" becomes "Pet_Friendly_Rank")
              var attribute = createAttID(d, rankData);
              createSlider(attData, rankData, attribute)
          } )

      //for loop to set 'y' attr for each slider because d3 is dumb and won't set it like it should
      for (i=0; i<rankData.length; i++){
          d3.select("#"+rankData[i]+"_FO")
              .attr("y", function(){
                  var yVal = 110;
                  yVal = yVal + (35*i);

                  return yVal;
              });
      };

};

function calcMinMax(attData, attribute){
    //start with min at highest possible and max at lowest possible values
    var min = Infinity,
        max = -Infinity;
    //loops through each object(i.e., city) in array of object
    attData.forEach(function(city){

            //doesn't count 0 as min value
            if (city[attribute] != 0){
                var attValue = +city[attribute];

                //test for min
                if (attValue < min){
                    min = attValue;
                };

                //test for max
                if (attValue > max){
                    max = attValue;
                };
            };
    });

    //return values as an array
    return [min, max]
};

function createMap(states, cities) {

    var mapWidth = 0.75;
    var width = window.innerWidth * mapWidth;
    var height = window.innerHeight;

    var map = d3.selectAll("body")
        .append("svg")
        .attr("class", "map")
        .attr("width", width)
        .attr("height", height);

    var g = map.append("g");

    //no idea how this works but it does
    //will probably need to change it once we decide how big
    //"mapWidth" is actually going to be
    var projection = d3.geo.mercator()
        .scale((width - 1)/2)
        .translate([width*1.3, height]);

    var zoom = d3.behavior.zoom()
        .scaleExtent([1, 8])
        .on("zoom", zoomed);

    var path = d3.geo.path()
        .projection(projection);

    //add the states to the map
    g.selectAll(".states")
            .data(states)
            .enter()
            .append("path")
            .attr("class", "us_states")
            .attr("d", path);

    map
        .call(zoom)
        .call(zoom.event);

    //function to control when the user zooms
    function zoomed() {
      g.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
      g.selectAll("circle")
            .attr("d", path.projection(projection));
    }

    //array to store coordinates for every city
    //there might be a better/more efficient way than to iterate through it like
    //this but for now it works and thats good enough
    var allCoordinates = [];

    g.selectAll(".circles")
            .data(cities)
            .enter()
            .append("circle")
            .attr("class", function(d) {return d.properties.ID})
            .attr("cx", function (d) { return projection(d.geometry.coordinates)[0]; })
            .attr("cy", function (d) { return projection(d.geometry.coordinates)[1]; })
            .attr("r", "6px")
            .attr("fill", "white")
            .attr("stroke", "black")
            .attr("stroke-width", "2px");
}


function createCitiesPanel(citiesArray){
    //citiesArray is an array of objects

    //sort array of object based on specified property
    citiesArray.sort(function(a, b) { return a.ID - b.ID })

    //set measurements for panel
    var cityMargin = 5,
    cityHeight = 800,
    cityHeight = cityHeight - cityMargin * 2,
    cityWidth = 400,
    cityWidth = cityWidth - cityMargin * 2,
    citySpacing = cityHeight / 40;
    // rectWidth = 4, rectHeight1 = 6, rectHeight2 = 11,
    // rectHeight3 = 16, rectSpacing = 3;

    // //array to hold all property names
    // var allAttributes = [];
    // console.log(attData[0]);
    // //push property names from attData into allAttributes array
    // for (var keys in attData[0]){
    //     allAttributes.push(keys);
    // };
    // //create an array with only properties with Raw values; for PCP display
    // var rawData = searchStringInArray("Raw", allAttributes);
    //
    // //create an array with only properties with Rank values; for calculation
    // var rankData = searchStringInArray("Rank", allAttributes);
    //
    // var attLabels = removeStringFromEnd("_Rank", rankData)
    //
    // attLabels = removeUnderscores(attLabels);

    // //empty array to hold length of each label
    // var labelLength = [];
    // //for loop to push all label lengths into array
    // for (i=0; i<rankData.length; i++) {
    //     var attLength = rankData[i].length;
    //     labelLength.push(attLength)
    // }

    // //identify which label is the longest so we can use that as the width in the transform for creating text elements
    // var labelWidth = Math.max.apply(Math, labelLength);

    //div container that holds SVG
    var cityContainer = d3.select("body").append("div")
        .attr("id", "cityContainer")

    //create svg for attpanel
    var citySvg = d3.select("#cityContainer").append("svg")
        .attr("class", "citySvg")
        .attr("width", "100%")
        .attr("height", cityHeight)
      .append("g")
        .attr("transform", "translate(" + cityMargin + "," + cityMargin + ")");// adds padding to group element in SVG

    var rectHeight = cityHeight / 9;
    //sets att title
    var cityTitleRect = citySvg.append("rect")
        .attr("id", "cityTitleRect")
        .attr("y", cityMargin)
        .attr("height", rectHeight)


    //used to place checkbox relative to attText labels
    var titleHeight = +d3.select("#cityTitleRect").attr("height") / 2,
    titleWidth = (+d3.select(".citySvg").node().getBBox().width) / 9,
    fontSize = 1.5 * titleHeight    // font fills rect

    var cityTitle = citySvg.append("text")
        .attr("id", "cityTitle")
        .attr("x", titleWidth)
        .attr("y", titleHeight*1.55)
        .text("Top Ranked Cities")
        .style("font-size", fontSize + "px")


    // creates a group for each rectangle and offsets each by same amount
    var cities = citySvg.selectAll('.cities')
        .data(citiesArray)
        .enter()
      .append("g")
        .attr("class", "cities")
        .attr("transform", function(d, i) {
            var height = 35;
            // console.log(height);
            var offset =  30;
            // console.log(offset);
            var horz = 10; //x value for g translate
            // var vert = i * height - offset; //y value for g translate
            var vert = i * height - offset; //y value for g translate
            return 'translate(' + horz + ',' + vert + ')';
      });

      //adds text to attribute g
      var cityText = cities.append('text')
          .attr("class", "attText")
          // .attr("x", attWidth / 5.8)
          // .attr("y", attHeight - 10)
          .text(function(d ) { return d.City })
          // .attr("id", function(d) {
          //     var attribute = createAttID(d, rankData)
          //
          //     return attribute;
          // });

  }


  function createAttID(d, rankData) {
      //put d in array because addUnderscores only takes an array
      var arrayD = [d]
      //add underscores back to labels so they match with object properties
      d = addUnderscores(arrayD);
      //returns attribute label followed by _Rank; this way we can access each attribute by its object property
      var attribute = searchStringInArray(d, rankData);
      //return attribute to a string from an array
      attribute = attribute[0];

      return attribute

}

function createSlider(attData, rankData, attribute) {
    //return array of min max values for specfied attribute
    var minMax = calcMinMax(attData, attribute);
    var min = minMax[0];
    var max = minMax [1];
    var sliderID = "#" + attribute + "-slider-range"
    var labelID = "#"+ attribute + "_rankVal"
    $(sliderID).slider({
        range: true,
        min: min,
        max: max,
        values: minMax,
        slide: function (event, ui) {
            $(labelID).val($(sliderID).slider("values", 0) +
          " - " + $(sliderID).slider("values", 1));
        }
    });
}

//function to parse properties based on a string
function searchStringInArray (str, strArray) {
    var newArray = [];
    for (var i=0; i<strArray.length; i++) {
        if (strArray[i].match(str)) {
            newArray.push(strArray[i]);
        };
    };
    return newArray;
};

//replaces underscores in property names with spaces
function removeUnderscores(array){
    var newArray = [];
    //remove underscores from strings in array
    for (i=0; i<array.length; i++) {
        var label = array[i]
        label = label.split("_").join(" ") //converts underscores in csv to spaces for display purposes
        newArray.push(label);
    };
    return newArray;
};
//replaces spaces in property names with underscores
function addUnderscores(array){
    var newArray = [];
    //remove underscores from strings in array
    for (i=0; i<array.length; i++) {
        var label = array[i]
        label = label.split(" ").join("_") //converts underscores in csv to spaces for display purposes
        newArray.push(label);
    };
    return newArray;
};
//removes string from end of each element
function removeStringFromEnd(searchStr, array){
    //new array to return
    var newArray = [];
    //length of input string
    var strLength =  searchStr.length;
    //loop through all array elements
    for (i=0; i<array.length; i++) {
            var string = array[i]

            var length = string.length;

            var end = length - strLength;

            var newString = string.slice(0, end);

            newArray.push(newString);
        };
    return newArray;
};
