// (function(){
window.onload = setPage();
          //pseudo-global variables

function setPage() {
    //set variable to use queue.js to parallelize asynchronous data loading
    var q = d3_queue.queue();
    //use queue to retrieve data from all files
    q
        .defer(d3.json, "data/US.topojson")//load states
        .defer(d3.json, "data/Cities.geojson")
        .defer(d3.csv, "data/Attributes.csv")
        .await(callback);

    //function called once data has been retrieved from all .defer lines
    function callback(error, statesData, citiesData, attData){
        // console.log(statesData);
        // console.log(citiesData);
        // console.log(attData);
        //convert topojsons into geojson objects
        var states = topojson.feature(statesData, statesData.objects.US).features;


        createMap(states);
        createAttPanel(attData);
    }
};

function createMap(states) {

}

function createAttPanel(attData) {

    //set measurements for panel
    var attMargin = {top: 50, right: 25, bottom: 20, left: 25},
    attHeight = window.innerHeight, //set height to entire window
    attHeight = attHeight - attMargin.top,
    attWidth = window.innerWidth * 0.25,//width of attSvg
    attWidth = attWidth - attMargin.left - attMargin.right, //width with margins for padding
    attSpacing = attHeight / 75; //vertical spacing for each attribute
    // labelWidth = ;

    //empty array to hold attribute labels
    var attLabels = [];
    //push properties from attData into attLabels array
    for (var keys in attData[0]){
        attLabels.push(keys);
    };
    //remove properties that are not attributes
    attLabels.splice(0, 3);

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
        .attr("y", 0)
        .text("Attributes")

    //creates a group for each rectangle and offsets each by same amount
    var attributes = attSvg.selectAll('.attributes')
        .data(attLabels)
        .enter()
      .append("g")
        .attr("class", "attributes")
        .attr("transform", function(d, i) {
            var height = labelWidth / 2 + attSpacing;
            var offset =  height * attLabels.length;
            var horz = -2 * labelWidth; //x value for g translate
            var vert = i * height - offset; //y value for g translate
            return 'translate(' + horz + ',' + vert + ')';
      });

      //adds text to attribute g
      var attText = attributes.append('text')
          .attr("class", "attText")
          .attr("x", attWidth / 3.75)
          .attr("y", attHeight - 40)
          .text(function(d ) { return d });



}




// });
