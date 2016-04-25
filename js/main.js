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


    // createDefaultAtts(attData);
    createAttPanel(attData);
}


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
    attWidth = 230,//width of attSvg
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
          .text(function(d ) { return d });

      //used to place checkbox relative to attText labels
      var textX = d3.select(".attText").attr("x")

      var checkboxes = variables.append("foreignObject")
          .attr('x', textX - 25)
          .attr('y', attHeight - 26)
          .attr('width', "50px")
          .attr('height', "20px")
          .append("xhtml:body")
          .html("<form><input type=checkbox id='check'</input></form>")

      //define x,y property values for first rectangle
      var x1 = (textX + labelWidth)*5
      var y1 = attHeight - 15

      //creates rect elements for weighting attribute
      var attRect1 = variables.append('rect')
          .attr("class", "attRect1")
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

      // //array to hold attributes so i can difference two arrays later
      // var allAttributes = [];
      //
      // //push properties from attData into attLabels array
      // for (var keys in attData[0]){
      //     keys = keys.split("_").join(" ") //converts underscores in csv to spaces for display purposes
      //     allAttributes.push(keys);
      // };
      //
      // //remove data identifiers we don't want displayed in panel
      // allAttributes.splice(0,3)
      //
      // var notSelected = [];
      //
      // for (i=0; i<allAttributes.length; i++){
      //     var notFound = $.inArray(allAttributes[i], attLabels)
      //     if (notFound == -1){
      //         notSelected.push(allAttributes[i])
      //     };
      // };

      // createAddButton(attSvg, notSelected);

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
    var strLength =  searchStr.length - 1;
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
