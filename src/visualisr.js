/**
 * File			js/visualisr.js
 * Author		Eric Seguin
 * Last mod		24 July 2015
 * Description	Open-source CSV-to-graph webapp built using JavaScript and the HTML5 Canvas API. 
 */

// Claim global variable Visualisr as base class
var Visualisr = function(canvas) {
	// Model objects
	this.table = new Visualisr.Table();
	this.plotData = new Visualisr.PlotData();
	this.axisPts = new Visualisr.AxisPts();
	
	this.canvas = canvas;
	this.context = canvas.getContext('2d');
};

// Default appearance options described in the docs. Users can configure these to their <3's desire
// by calling Visualisr.defaults.something = value
Visualisr.defaults = {
	
	global: {
		scale: 1,	// scale factor on all canvas elements
	},
	
	color: {
		bg: "#222",			// canvas background colour
		axis: "#ccc",		// axis & notation colour
		title: "#f0f0f0",	// timeline title colour
		
		bubblesStart: "#0055FF",	// leftmost colour on plot points gradient (hexadecimal values only)
		bubblesEnd: "#FF0055",		// rightmost colour on plot points gradient (hexadecimal values only)
		bubbleOpacity: 0.35,		// plot point opacity (between 0 and 1)
	},
	
	font: {
		face: "Open Sans",	// global font face
		scale: 1,			// scale factor on all canvas text
		
		axisSize: 11,
		axisLabelSize: 16,
		titleSize: 28,
	},
	
	layout: {
		padding: 40,	// canvas padding
		axisWidth: 2,	// axis line thickness
		minPeriodX: 50,	// minimum spacing between x-axis subdivisions
		minPeriodY: 30,	// minimum spacing between y-axis subdivisions
	}

};

// Global variables
Visualisr.global = {
	
	pixelRatio: 1,
	
	font: {
		axis: "",
		axisLabel: "",
		title: "",
	},
	
};

// Object containing all global utilities (methods and classes)
Visualisr.helpers = {};

/**
 * Method: applyPixelRatio()
 * Scale pixel-sized elements by 1.5x the device pixel ratio.
 */ 
Visualisr.helpers.applyPixelRatio = function() {
	// Get device pixel ratio and compare to browser's canvas scaling
	Visualisr.global.pixelRatio = (function () {
	    var ctx = document.createElement("canvas").getContext("2d"),
	        dpr = window.devicePixelRatio || 1,
	        bsr = ctx.webkitBackingStorePixelRatio ||
	              ctx.mozBackingStorePixelRatio ||
	              ctx.msBackingStorePixelRatio ||
	              ctx.oBackingStorePixelRatio ||
	              ctx.backingStorePixelRatio || 1;
	
	    return dpr / bsr;
	})();
	
	// Apply scaling if necessary
	if (pixelRatio != 1) {
		var ratio = pixelRatio/1.5;
		
		Visualisr.defaults.layout.padding *= ratio;
		Visualisr.defaults.layout.axisWidth *= ratio;
		Visualisr.defaults.layout.minPeriodX *= ratio;
		Visualisr.defaults.layout.minPeriodY *= ratio;
		
		Visualisr.defaults.font.scale *= ratio;
		
		Visualisr.makeFontStrings();
	}
};

/**
 * Method: makeFontStrings()
 * Build font strings from values in Visualisr.defaults.font. Uses the global font face for
 * all text and the global scale factor to adjust font size.
 */
Visualisr.helpers.makeFontStrings = function() {
	var face = Visualisr.defaults.font.face;
	
	// axis notation font
	var axisSize = Visualisr.defaults.font.scale * Visualisr.defaults.font.axisSize;
	Visualisr.global.font.axis = axisSize + "px " + face;
	
	// axis label font
	var axisLabelSize = Visualisr.defaults.font.scale * Visualisr.defaults.font.axisLabelSize;
	Visualisr.global.font.axisLabel = "bold " + axisLabelSize + "px " + face;
	
	// graph title font
	var titleSize = Visualisr.defaults.font.scale * Visualisr.defaults.font.titleSize;
	Visualisr.global.font.title = "bold " + titleSize + "px " + face;
};

/**
 * Class: Pair(x,y)
 * Simple class representing a pair of values. Used to store data pairs and point coordinates.
 * 
 * Constructor parameters:
 *		- x: number or string
 *		- y: number or string
 */
Visualisr.helpers.Pair = function(x, y) {
	this.x = x;
	this.y = y;
};

/**
 * Class: DataAttr(x,y)
 * Contains various attributes of a column in the internal data table (min value, max value, the
 * difference between them, and an estimation of the average distance between adjacent values)
 */
Visualisr.DataAttr = function() {
	this.min = 0;
	this.max = 0;
	this.delta = 0;
	this.avgDistance = 0;
};

/**
 * Class: Table()
 * One of the three model classes. It contains an internal table of data pairs and is used to
 * store and handle user data input.
 */
Visualisr.Table = function() {
	this.data = Array();	// internal table
};

/**
 * Method: Table.generateTable()
 * Loops through internal data table and renders it on page so the user can view it, make changes,
 * and select the data to show on the graph.
 */
Visualisr.Table.prototype.generateTable = function() {
	// empty previous table
	var tbody = document.createElement("tbody");
	$("#data-table").html(tbody);
	
	// fill table cell by cell
	for (i=0; i < this.data.length; i++) {
		var tr = $(document.createElement("tr")).attr("id", "row-"+i);
		$("#data-table tbody").append(tr);
		
		for (j=0; j < this.data[i].length; j++) {
			var td = $(document.createElement("td")).attr("contenteditable", "true")
													.attr("data-col", j);
			
			if (j==0) {
				$(td).addClass("selected-x");
			} else if (j==1) {
				$(td).addClass("selected-y");
			}
			
			$(td).text(this.data[i][j]);
			$("#data-table tbody #row-" + i).append(td);
		}
	}
};


/**
 * PlotData class
 */

Visualisr.PlotData = function() {
	// Plot descriptions
	this.title;
	this.xlabel;
	this.ylabel;
	
	// Plot points
	this.pts;			// array of all accepted (i.e. numeric) plot points
	this.ambig;	// ambiguity values for each saved point
	this.size;
	
	// Other attributes
	this.xAttr;
	this.yAttr;
	
	this.init();
};

Visualisr.PlotData.prototype.init = function() {
	// Plot descriptions
	this.title = "";
	this.xlabel = "";
	this.ylabel = "";
	
	// Plot points
	this.pts = Array( /* Pair point */ );			// array of all accepted (i.e. numeric) plot points
	this.ambig = Array( /* float ambigValue */ );	// ambiguity values for each saved point
	this.size = 0;
	
	// Other attributes
	this.xAttr = new Visualisr.DataAttr();
	this.yAttr = new Visualisr.DataAttr();
};

// push([*] x, [*] y): Interprets a pair of values of any type and adds it to appropriate part of PlotTable
Visualisr.PlotData.prototype.push = function(pair) {
	x = processNumString(pair.x);
	y = processNumString(pair.y);
	
	var typeStr = $.type(x) + " " + $.type(y);	// e.g. "string number"
	
	switch (typeStr) {
		case "number number":
			var pair = new Visualisr.Pair(x,y);
			this.pts.push(pair);
			this.ambig.push(0);
			this.size++;
			break;
		case "string string":
			this.xlabel += x;
			this.ylabel += y;
			break;
		case "string number":
		case "number string":
		default:
			console.log("Unable to interpret pair: (" + x + ", " + y + ")");
			var pair = new Visualisr.Pair(x,y);
			this.pts.push(pair);
			this.ambig.push(1);
			this.size++;
			break;
	}
};

// SetPoint(int i, int x, int y): Set value of point at this.pts[index] 
Visualisr.PlotData.prototype.setPoint = function(index, point) {
	this.pts[index] = point;
};

Visualisr.PlotData.prototype.getAttr = function() {
	var xMin = this.pts[0].x;	// assign initial values to min, max
	var xMax = this.pts[0].x;
	
	var yMin = this.pts[0].y;
	var yMax = this.pts[0].y;
	
	$(this.pts).each(function(i, pair) {
		xMin = Math.min(xMin, pair.x);	// compare current pair to saved values, ovewrite if lesser
		xMax = Math.max(xMax, pair.x);	//											  ... if greater
		
		yMin = Math.min(yMin, pair.y);
		yMax = Math.max(yMax, pair.y);
	});
	
	// // get avg distance between points
	// var avgDistance = 0;
	// var nDiff = col.length - 1;
	// $(col).each(function() {
		// // TODO: Calculate avg distance
	// });
	
	this.xAttr.min = xMin;	// assign values
	this.xAttr.max = xMax;
	
	this.yAttr.min = yMin;
	this.yAttr.max = yMax;
	
	this.xAttr.delta = xMax - xMin;	// calculate delta
	this.yAttr.delta = yMax - yMin;
};


/**
 * Graph dimensions class
 */

Visualisr.AxisPts = function() {
	// vertical axis
	this.maxY;
	this.midY;
	
	// horizontal axis
	this.maxX;
	this.midX;
};

Visualisr.AxisPts.prototype.update = function() {
	this.maxY = Math.floor(-canvas.height + 2*PADDING_OUTER);
	this.midY = Math.floor(axisPts.maxY/2);
	
	this.maxX = Math.floor(canvas.width - 2*PADDING_OUTER);
	this.midX = Math.floor(axisPts.maxX/2);
};


/**
 * Graph class
 */

Visualisr.Graph = function() {
	// dimensions
	this.width;
	this.height;
	this.padding = PADDING_OUTER;
};

Visualisr.Graph.prototype.setWidth = function(w) {
	
};
























/**
 * Sample data
 */

/* 21st century volcano sample (small) */
xCol = ["2000", "2001", "2002", "2002", "2002", "2004", "2006", "2008", "2008", "2008", "2009", "2010", "2010", "2011", "2011", "2011", "2014", "2014", "2014", "2015"],
yCol = ["4", "4", "1", "4", "4", "4", "4", "4", "4", "4", "4", "4", "4", "4", "5", "4", "2", "4", "3", "4"];

title = "Volcano eruptions by VEI";
xlabel = "Year";
ylabel = "Volcanic explosivity index (VEI)";

/* Volcano deaths sample (medium)
var xCol = ["1586", "1630", "1631", "1783", "1792", "1815", "1822", "1877", "1883", "1886", "1894", "1897", "1902", "1902", "1902", "1902", "1911", "1919", "1930", "1951", "1953", "1963", "1968", "1980", "1982", "1985", "1991", "1991", "1993", "1997", "2002", "2010", "2011", "2014"];
var yCol = ["10000", "192", "3360", "1151", "15000", "102000", "4000", "1000", "36000", "150", "65", "1335", "33000", "6000", "1680", "150", "1335", "5115", "1369", "2942", "152", "1584", "87", "57", "3500", "23000", "847", "43", "9", "19", "245", "353", "31", "57"];

plotData.title = "Deaths due to volcanic eruptions over time";
plotData.xlabel = "Year";
plotData.ylabel = "Volcano deaths";
*/

/* Canadian population sample (large) 
var xCol = ["1955", "1930", "1905", "1880", "1954", "1929", "1904", "1879", "1953", "1928", "1903", "1878", "1977", "1952", "1927", "1902", "1877", "1976", "1951", "1926", "1901", "1876", "1975", "1950", "1925", "1900", "1875", "1974", "1949", "1924", "1899", "1874", "1973", "1948", "1923", "1898", "1873", "1972", "1947", "1922", "1897", "1872", "1971", "1946", "1921", "1896", "1871", "1970", "1945", "1920", "1895", "1870", "1969", "1944", "1919", "1894", "1869", "1968", "1943", "1918", "1893", "1868", "1967", "1942", "1917", "1892", "1867", "1966", "1941", "1916", "1891", "1965", "1940", "1915", "1890", "1964", "1939", "1914", "1889", "1963", "1938", "1913", "1888", "1962", "1937", "1912", "1887", "1961", "1936", "1911", "1886", "1960", "1935", "1910", "1885", "1959", "1934", "1909", "1884", "1958", "1933", "1908", "1883", "1957", "1932", "1907", "1882", "1956", "1931", "1906"];
var yCol = ["15698", "10208", "6002", "4255", "15287", "10029", "5827", "4185", "14845", "9835", "5651", "4120", "23258", "14459", "9637", "5494", "4064", "22993", "14009", "9451", "5371", "4009", "22697", "13712", "9294", "5301", "3954", "22364", "13447", "9143", "5235", "3895", "22043", "12823", "9010", "5175", "3826", "21802", "12551", "8919", "5122", "3754", "21568", "12292", "8788", "5074", "3689", "21297", "12072", "8556", "5026", "3625", "21001", "11946", "8311", "4979", "3565", "20701", "11795", "8148", "4931", "3511", "20378", "11654", "8060", "4883", "3463", "20015", "11507", "8001", "4833", "19644", "11381", "7981", "4779", "19291", "11267", "7879", "4729", "18931", "11152", "7632", "4678", "18583", "11045", "7389", "4626", "18238", "10950", "7207", "4580", "17870", "10845", "6988", "4537", "17483", "10741", "6800", "4487", "17080", "10633", "6625", "4430", "16610", "10510", "6411", "4375", "16081", "10377", "6097"];

plotData.title = "Estimated population of Canada, 1867 to 1977 (thousands)";
plotData.xlabel = "Year";
plotData.ylabel = "Population (thousands)";
*/

// for (i=0; i<xCol.length; i++) {
	// var pair = new Visualisr.helpers.Pair(xCol[i], yCol[i]);
	// plotData.push(pair);
// }


/**
 * General functions
 */

function bindWindowResize() {
	var rtime;
	var timeout = false;
	var rwait = 100;
	
	$(window).on("resize", function() {
		rtime = new Date();
		if (timeout === false) {
			timeout = true;
			setTimeout(resizeEnd, rwait);
		}
	});
	
	function resizeEnd() {
		if (new Date() - rtime < rwait) {
			setTimeout(resizeEnd, rwait);
		} else {
			timeout = false;
			resizeCanvas();
		}
	}
}

function processNumString(num) {
	if (typeof(num) == "object") { num = num.data; }
	
	if (!$.isNumeric(num)) {
		var numProcessed = num.replace(',', '').replace(' ', '');
		
		if ($.isNumeric(numProcessed)) {		// string can be numeric
			return parseFloat(numProcessed);	// process; return as float
		} else {				// string is not numeric
			return String(num);	// don't process; return as string
		}
	} else {					// string is numeric
		return parseFloat(num);	// don't process; return as float
	}
}


/**
 * Table functions
 */

function handleFile() {
	var files = this.files;
	var reader = new FileReader();	// create FileReader() instance
	
	reader.readAsText(files[0]);	// read first File() object in files (a FileList() object)
	
	reader.onload = function(event) {	// get data once file is read
		console.log("Successfully read file: " + files[0].name);
		csvData = reader.result;
		
		// parse data
		table.data = $.csv.toArrays(csvData);
		
		if(table.data[0].length < 2) {
			alert("Error reading " + files[0].name + ": File must contain at least 2 data columns");
			var form = document.getElementById("file-upload-form");
			form.reset();
		} else {
			// render data in #data-table
			table.generateTable();
			$("#data-table-overlay").fadeIn();
			$("#data-table").fadeIn();
			$("#data-table-submit").fadeIn();
			$("#data-table-buttons").fadeIn();
		}
	};
}

function submitDataTable() {
	var xSel = $("#data-table td.selected-x").contents();
	var ySel = $("#data-table td.selected-y").contents();
	
	// check that xSel and ySel have the same length
	if (xSel.length != ySel.length) {
		return (xSel.length - ySel.length);	// return number of missing Y cells
	} else {
		// reset plotData
		plotData.init();
		
		// store selected cells
		for (i=0; i < xSel.length; i++) {
			var pair = new Visualisr.Pair(xSel[i], ySel[i]);
			plotData.push(pair);
		}
	}
	
	// close #data-table
	$("#data-table-overlay").fadeOut(300);
	$("#data-table").fadeOut(300);
	$("#data-table-submit").fadeOut(300);
	$("#data-table-buttons").fadeOut(300);
	
	// draw results on timeline
	drawToCanvas();
	
	// empty #data-table and reset buttons
	setTimeout(function() {
		$("#data-table-buttons a.active").removeClass("active");
		$("#data-table tbody").empty();
	}, 300);
}

function toggleTableSelection(nowSelecting) {	// argument values: "x", "y", "0"
	// set nowSelecting to new selector
	$("#data-table").data("now-selecting", nowSelecting);
	
	if (nowSelecting == "x" || nowSelecting == "y") {
		$("#data-table td").off("click");		// remove previous table cell bindings
		
		var $currentButton = $("#data-table-buttons a#" + nowSelecting + "-picker");
		
		if ($currentButton.hasClass("active")) {	// if button was already active
			$currentButton.removeClass("active");	// remove active class from button
		} else {													// if button wasn't already active
			$("#data-table-buttons .active").removeClass("active");	// remove active highlight from previous column picker button
			$currentButton.addClass("active");						// then add active class to current button
			
			// bind clicks on table cells
			$("#data-table td").on("click", function(event) {
				// if first row selected, select whole column
				if ($(this).parent().attr("id") == "row-0") {
					console.log("Selecting column");
					$select = $("#data-table td[data-col='" + $(this).attr("data-col") + "']");
				} else {
					$select = $(this);
				}
				
				// if it's just a random cell, select only that cell
				if ($(this).hasClass("selected-" + nowSelecting)) {
					$select.removeClass("selected-" + nowSelecting);
				} else {
					$select.removeClass("selected-x").removeClass("selected-y");
					$select.addClass("selected-" + nowSelecting);
				}
			});
		}
	}
}


/**
 * Canvas functions
 */

function generateColours(nPoints) {
	// check if cfg colours are valid hex values
	var regex = new RegExp(/^#[0-9A-F]{6}$/i);
	if (regex.test(COLOR_GRAPH_START.slice(1,7))) {	// if check fails, substitute default (red)
		console.log("Invalid value in canvas.cfg.js: timelineStartColor = " + COLOR_GRAPH_START);
		COLOR_GRAPH_START = "#FF0000";
	}
	if (regex.test(COLOR_GRAPH_END.slice(1,7))) {		// if check fails, substitute default (blue)
		console.log("Invalid value in canvas.cfg.js: timelineEndColor = " + COLOR_GRAPH_END);
		COLOR_GRAPH_END = "#0000FF";
	}
	
	// extract RGB values
	var start = {
		'r': parseInt(COLOR_GRAPH_START.slice(1,3), 16),
		'g': parseInt(COLOR_GRAPH_START.slice(3,5), 16),
		'b': parseInt(COLOR_GRAPH_START.slice(5,7), 16)
	};
	var end = {
		'r': parseInt(COLOR_GRAPH_END.slice(1,3), 16),
		'g': parseInt(COLOR_GRAPH_END.slice(3,5), 16),
		'b': parseInt(COLOR_GRAPH_END.slice(5,7), 16)
	};
	
	// generate colours and populate rgbStrings array
	var colours = Array();
	var rgbaStrings = Array();
	
	for (i=0; i<nPoints; i++) {
		// calculate intermediate colour values
		colours[0] = Math.floor(((end.r - start.r)/(nPoints - 1))*i + start.r);
		colours[1] = Math.floor(((end.g - start.g)/(nPoints - 1))*i + start.g);
		colours[2] = Math.floor(((end.b - start.b)/(nPoints - 1))*i + start.b);
	
		// add to rgbStrings array
		rgbaStrings[i] = "rgba(" + colours[0] + "," + colours[1] + "," + colours[2] + "," + OPACITY_GRAPH + ")";
	}
	
	return rgbaStrings;
}

function drawToCanvas() {
	// clear canvas before redrawing
	context.clearRect(-PADDING_OUTER, axisPts.maxY - PADDING_OUTER, canvas.width, canvas.height);
	
	// TODO: Determine time axis type (years, days, timestamps, ...)
	
	// determine x and y axis attributes & periods
	plotData.getAttr();
	
	plotData.xAttr.period = Math.ceil(axisPts.maxX/(plotData.xAttr.delta + 2));
	plotData.yAttr.period = Math.ceil(-axisPts.midY/(plotData.yAttr.delta + 2));
	
	// trace content
	traceBG();											// background
	traceDataPoints(plotData.xAttr, plotData.yAttr);	// data points
	traceAxes();										// axes
	traceLabels();										// axis labels
	traceTitle();										// graph title
	traceAxisNotation(plotData.xAttr, plotData.yAttr);	// axis subdivisions
	
	// TODO: Animate canvas elements (axes slide outwards with progressive axis notches, vertical lines rotate into circle graphs, labels fade in)
}

function resizeCanvas() {
	// reset origin and pixel ratio before resizing
    context.setTransform(PIXEL_RATIO, 0, 0, PIXEL_RATIO, 0, 0);
    
	// set canvas dimensions
	var w = $(window).width();
	var h = ($(window).height() - $("header").outerHeight(true));
	
	canvas.width = PIXEL_RATIO * w;
	canvas.height = PIXEL_RATIO * h;
	canvas.style.width = w + "px";
	canvas.style.height = h + "px";
	
	// update axis variables
	axisPts.update();
	
	// set canvas origin to bottom-left corner
	context.translate(PADDING_OUTER, Math.floor(canvas.height - PADDING_OUTER));
	
	// draw on canvas
	if (xCol.length >= 2) {
		drawToCanvas(xCol, yCol);
	}
}

function traceBG() {
	context.rect(-PADDING_OUTER, PADDING_OUTER, canvas.width, -canvas.height);
	context.fillStyle = COLOR_BG;
	context.fill();
}

function traceDataPoints(xAttr, yAttr) {
	// generate data colours
	var yColours = generateColours(yCol.length - 1);
	
	// trace each data point
	for (k=0; k<yCol.length; k++) {
		// get period multipliers
		x = plotData.pts[k].x - xAttr.min;
		y = plotData.pts[k].y - yAttr.min;
		
		var path = new Path2D();
		path.arc((x+1)*xAttr.period, axisPts.midY, y*yAttr.period, 0, Math.PI*2, false);
		context.fillStyle = yColours[k];
		context.fill(path);
	}
}

function traceAxes() {
	// plot horizontal axis
	var axisX = new Path2D();
	axisX.moveTo(0, axisPts.midY);				// axis line
	axisX.lineTo(axisPts.maxX, axisPts.midY);
	axisX.moveTo(axisPts.maxX - 5, axisPts.midY - 5);	// axis arrow
	axisX.lineTo(axisPts.maxX, axisPts.midY);
	axisX.lineTo(axisPts.maxX - 5, axisPts.midY + 5);
	
	// plot vertical axis
	var axisY = new Path2D();
	axisY.moveTo(0, 0);			// axis line
	axisY.lineTo(0,	axisPts.maxY);
	axisY.moveTo(-5, axisPts.maxY + 5);	// axis arrow
	axisY.lineTo(0,	axisPts.maxY);
	axisY.lineTo(5, axisPts.maxY + 5);
	
	// set line style
	context.strokeStyle = COLOR_AXIS;
	context.lineWidth = LINE_WIDTH_AXIS;
	context.lineCap = "round";
	
	// trace axes
	context.stroke(axisX);
	context.stroke(axisY);
}

function traceLabels() {
	var xlabel = plotData.xlabel;
	var ylabel = plotData.ylabel;
	
	// add axis labels
	context.font = FONT_STR_AXIS_LABELS;
	context.fillStyle = COLOR_AXIS;
	
	context.textAlign = "right";
	context.fillText(xlabel, axisPts.maxX, axisPts.midY - 15);
	
	context.textAlign = "left";
	context.fillText(ylabel, 15, axisPts.maxY + FONT_SIZE_GLOBAL);
}

function traceTitle() {
	var title = plotData.title;
	
	context.font = FONT_STR_TITLE;
	context.fillStyle = COLOR_TITLE;
	context.textAlign = "center";
	
	var titleWidth = context.measureText(title).width;
	
	if (titleWidth > (canvas.width - PADDING_OUTER*3)) {
		var titleWords = title.split(" ");
		var nWords = Math.ceil(titleWords.length/2);
		
		// empty title
		title = Array();
		title[0] = "";
		title[1] = "";
		
		for(i = 0; i < nWords; i++) {
			if (i>0) { title[0] += " "; }
			title[0] += titleWords[i];
		}
		
		for(i = nWords; i < titleWords.length; i++) {
			if (i>nWords) { title[1] += " "; }
			title[1] += titleWords[i];
		}
		
		// try measuring again
		titleWidth = Math.max(context.measureText(title[0]).width, context.measureText(title[1]).width);
		var shrinkFactor = 1;
		
		while (titleWidth > (canvas.width - PADDING_OUTER*3) && shrinkFactor > 0.5) {
			shrinkFactor *= 0.75;
			context.font = "bold " + FONT_SIZE_TITLE*shrinkFactor + "px " + FONT_FACE_GLOBAL;
			
			titleWidth = Math.max(context.measureText(title[0]).width, context.measureText(title[1]).width);
		}
		
		context.fillText(title[0], axisPts.midX, axisPts.maxY + 2*FONT_SIZE_TITLE*(Math.sqrt(shrinkFactor)));
		context.fillText(title[1], axisPts.midX, axisPts.maxY + 2*FONT_SIZE_TITLE*(Math.sqrt(shrinkFactor)) + 1.5*FONT_SIZE_TITLE*shrinkFactor);
	} else {
		context.fillText(title, axisPts.midX, axisPts.maxY + 2*FONT_SIZE_TITLE);
	}
}

function traceAxisNotation(xAttr, yAttr) {
	// TODO: Fix edge-case where x or y values begin at 0 (set 0 at origin, not separate notch)
	// TODO: Set max amount of data points (if above threshold, use only every nth data where n = ceil(threshold/nData) )
	
	// notate axes
	context.font = FONT_STR_AXIS_SUBDIVS;
	context.fillStyle = COLOR_AXIS;
	
	// adjust periods
	if (xAttr.period < MIN_X_PERIOD) {
		var xNotchSpacing = MIN_X_PERIOD/xAttr.period;
		var newWidth = xAttr.period * (xAttr.delta + 2) + 2*PADDING_OUTER;	// resize canvas width to accomodate large content
	}
	
	if (yAttr.period < MIN_Y_PERIOD) {
		var yMultiplier = MIN_Y_PERIOD/yAttr.period;
	} else {
		var yMultiplier = 1;
	}
	
	// notate x axis
	for (i=0; i <= (xAttr.delta); i++) {
		var notch = new Path2D();
		var x = (i+1)*xAttr.period;
		
		notch.moveTo(x, axisPts.midY - 6);
		notch.lineTo(x, axisPts.midY + 6);
		context.stroke(notch);
		
		context.textAlign = "center";
		context.fillText(xAttr.min + i, x, axisPts.midY + 2*FONT_SIZE_AXIS_SUBDIVS);
	}
	
	// notate y axis
	for (j=0; j <= yAttr.delta; j++) {
		var notch = new Path2D();
		var yPos = axisPts.midY - (j+1)*yAttr.period;
		var yNeg = axisPts.midY + (j+1)*yAttr.period;
		
		notch.moveTo(-5, yPos);	// positive values
		notch.lineTo(5, yPos);
		notch.moveTo(-5, yNeg);	// negative values
		notch.lineTo(5, yNeg);
		context.stroke(notch);
		
		context.textAlign = "right";
		context.fillText(yAttr.min + j, -FONT_SIZE_GLOBAL, yPos + 5);
		context.fillText(yAttr.min + j, -FONT_SIZE_GLOBAL, yNeg + 5);
	}
}
