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
    var height = window.innerHeight *0.95;
    
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
        // .scale((width - 1)/2)
        .scale((width*(3/4)))
        .translate([width*2, height]);

   // define what happens on zoom
    var zoom = d3.behavior.zoom()
        .scaleExtent([1, 2])
        .on("zoom", zoomed);

    //set the projection
    var path = d3.geo.path()
        .projection(projection);

        //define the radius of the prop symbols.
        // the domain should be the max and min values of the data set
    var radius = d3.scale.sqrt()
            .domain([1, 50])
            .range([2, 30]);

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



    //for now the prop symbols use the ID to scale the symbol to the correct size. 
    // once we have our overall ranks worked out we'll swap that value in instead
    g.selectAll(".circles")
        //sort the data so that smaller values go on top (so the small circles appear on top of the big circles)
        .data(cities.sort(function(a, b) { return b.properties.ID - a.properties.ID; }))
        .enter()
        .append("path")
        //set the radius
        .attr('d', path.pointRadius(function(d) { return radius(d.properties.ID)}))
        //assign the id
        .attr("class", function(d) {return d.properties.ID})
        //assign the location of the city according to coordinates
        .attr("cx", function (d) { return projection(d.geometry.coordinates)[0]; })
        .attr("cy", function (d) { return projection(d.geometry.coordinates)[1]; })
        .attr("fill", "blue")
        .attr("stroke", "white")
        .attr("stroke-width", "2px");



    //function to control when the user zooms
    function zoomed() {
        // var t = d3.event.translate,
        //     s = d3.event.scale;
        //     t[0] = Math.min(width / 2 * (s - 1), Math.max(width / 2 * (1 - s), t[0]));
        //     t[1] = Math.min(height / 2 * (s - 1) + 230 * s, Math.max(height / 2 * (1 - s) - 230 * s, t[1]));
        //     zoom.translate(t);

          g.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
          
          //redefine the radius' range to be scaled by the scale
          radius.range([2/d3.event.scale, 30/d3.event.scale]);

          //select all the circles and change the radius and stroke width as the scale changes
          g.selectAll("path")

                .attr('d', path.pointRadius(function(d) {  return radius(d.properties.ID); }))
                .attr("stroke-width", (1/d3.event.scale)*2+"px");
    }
}
