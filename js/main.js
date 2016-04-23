// (function(){
console.log("working");
window.onload = setPage();
          //pseudo-global variables

function setPage() {
    //set variable to use queue.js to parallelize asynchronous data loading
    var q = d3_queue.queue();
console.log("setpage");
    //use queue to retrieve data from all files
    q
        .defer(d3.json, "data/US.topojson")//load states
        .defer(d3.json, "data/Cities.topojson")
        .defer(d3.csv, "data/Attributes.csv")
        .await(callback);

    //function called once data has been retrieved from all .defer lines
    function callback(error, statesData, citiesData, attData){
        console.log(statesData);
        console.log(citiesData);
        console.log(attData);
        //convert topojsons into geojson objects
        var states = topojson.feature(statesData, statesData.objects.US).features;
        var cities = topojson.feature(citiesData, citiesData.objects.collection).features;
        // cities = ;
        console.log(statesData);
        console.log(citiesData);
        console.log(cities);


        createMap(states, cities);
        // addCities(citiesData);
    }
};

function createMap(states, cities) {

    var mapWidth = 0.75;
    var width = window.innerWidth * mapWidth;
    var height = window.innerHeight;
    
    var map = d3.selectAll("body")
        .append("svg")
        .attr("class", "map")
        .attr("width", width)
        .attr("height", height)
        .append("g");

    var g = map.append("g");

    var projection = d3.geo.mercator()
        .center([-50,0])
        .scale((width - 1)/2)
        .translate([width, height]);

    var zoom = d3.behavior.zoom()
        .scaleExtent([1, 8])
        .on("zoom", zoomed);

    var path = d3.geo.path()
        .projection(projection);

    g.selectAll(".states")
            .data(states)
            .enter()
            .append("path")
            .attr("class", "us_states")
            .attr("d", path);

    map
        .call(zoom)
        .call(zoom.event);


    function zoomed() {
      g.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
      // circles.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
      g.selectAll("circle")
            .attr("d", path.projection(projection));
    }

    console.log(cities);

    var allCoordinates = [];
    cities.forEach(function(d){
        console.log(d);
        var coordinates = d.geometry.coordinates;
        console.log(coordinates);
        var id = "id" + d.properties.ID;
        var desc = d.properties.desc;

        allCoordinates.push(coordinates);
    
        
    })

    g.selectAll(".states")
            .data(allCoordinates)
            .enter()
            .append("circle")
            .attr("cx", function (d) { console.log(d); return projection(d)[0]; })
            .attr("cy", function (d) { return projection(d)[1]; })
            .attr("r", "6px")
            .attr("fill", "black")
}

//function to add the cities onto the map
// insprired by http://bl.ocks.org/phil-pedruco/7745589








// });
