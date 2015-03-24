//var jsonCircles = [{ "x_axis": 30, "y_axis": 30, "radius": 20, "color" : "green" }, { "x_axis": 70, "y_axis": 70, "radius": 20, "color" : "purple"}, { "x_axis": 110, "y_axis": 100, "radius": 20, "color" : "red"}];

//var svgContainer = d3.select("body").append("svg").attr("width", 200).attr("height", 200);
 
//var circles = svgContainer.selectAll("circle").data(jsonCircles).enter().append("circle");

//var circleAttributes = circles.attr("cx", function (d) { return d.x_axis; }).attr("cy", function (d) { return d.y_axis; }).attr("r", function (d) { return d.radius; }).style("fill", function(d) { return d.color; });

//Make an SVG Container
//var svgContainer = d3.select("body").append("svg").attr("width", 200).attr("height", 200);

//Draw the Circle
//var circle = svgContainer.append("circle").attr("cx", 30).attr("cy", 30).attr("r", 20);



var circles = d3.selectAll("circle");
circles.style("fill", "steelblue");
circle.attr("r", 30);
//circle.attr("cx", function() { return Math.random() * 720; });
circles.data([32, 57, 112]);
circles.attr("r", function(d) { return Math.sqrt(d); });