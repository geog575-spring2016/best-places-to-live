(function(){

window.onload = setPage();
          //pseudo-global variables

function setPage() {
    //set variable to use queue.js to parallelize asynchronous data loading
    var q = d3_queue.queue();

    //use queue to retrieve data from all files
    q
        .defer(d3.json, "data/US.topojson")//load states\
        //add defer function for cities
        //add defer function for data
        .await(callback);

    //function called once data has been retrieved from all .defer lines
    function callback(error, statesData){
        //convert topojsons into geojson objects
        var states = topojson.feature(statesData, statesData.objects.states).features;

        createMap(states);
    }
};

function createMap(states) {
    
}






});
