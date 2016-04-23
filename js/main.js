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

        createMap(states, cities);
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
            .attr("cx", function (d) { console.log(d); return projection(d.geometry.coordinates)[0]; })
            .attr("cy", function (d) { return projection(d.geometry.coordinates)[1]; })
            .attr("r", "6px")
            .attr("fill", "white")
            .attr("stroke", "black")
            .attr("stroke-width", "2px");
}
