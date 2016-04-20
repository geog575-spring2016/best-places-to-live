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
        .defer(d3.json, "data/Cities.geojson")
        .defer(d3.csv, "data/Attributes.csv")
        .await(callback);

    //function called once data has been retrieved from all .defer lines
    function callback(error, statesData, citiesData, attData){
        console.log(statesData);
        console.log(citiesData);
        console.log(attData);
        //convert topojsons into geojson objects
        var states = topojson.feature(statesData, statesData.objects.US).features;
        // cities = ;

        createMap(states);
    }
};

function createMap(states) {

}






// });
