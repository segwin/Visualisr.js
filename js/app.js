/**
 * File			js/app.js
 * Author		Eric Seguin
 * Last mod		23 July 2015
 * Description	Configuration values for timeline style
 */


/**
 * Global variables
 */

var canvas,
	context;
	
var topY, midY, rightX, midX;

var data = Array();
var xCol = ["Year", "1955", "1930", "1905", "1880", "1954", "1929", "1904", "1879", "1953", "1928", "1903", "1878", "1977", "1952", "1927", "1902", "1877", "1976", "1951", "1926", "1901", "1876", "1975", "1950", "1925", "1900", "1875", "1974", "1949", "1924", "1899", "1874", "1973", "1948", "1923", "1898", "1873", "1972", "1947", "1922", "1897", "1872", "1971", "1946", "1921", "1896", "1871", "1970", "1945", "1920", "1895", "1870", "1969", "1944", "1919", "1894", "1869", "1968", "1943", "1918", "1893", "1868", "1967", "1942", "1917", "1892", "1867", "1966", "1941", "1916", "1891", "1965", "1940", "1915", "1890", "1964", "1939", "1914", "1889", "1963", "1938", "1913", "1888", "1962", "1937", "1912", "1887", "1961", "1936", "1911", "1886", "1960", "1935", "1910", "1885", "1959", "1934", "1909", "1884", "1958", "1933", "1908", "1883", "1957", "1932", "1907", "1882", "1956", "1931", "1906"];
var yCol = ["Estimated population of Canada, 1867 to 1977 (thousands)", "15698", "10208", "6002", "4255", "15287", "10029", "5827", "4185", "14845", "9835", "5651", "4120", "23258", "14459", "9637", "5494", "4064", "22993", "14009", "9451", "5371", "4009", "22697", "13712", "9294", "5301", "3954", "22364", "13447", "9143", "5235", "3895", "22043", "12823", "9010", "5175", "3826", "21802", "12551", "8919", "5122", "3754", "21568", "12292", "8788", "5074", "3689", "21297", "12072", "8556", "5026", "3625", "21001", "11946", "8311", "4979", "3565", "20701", "11795", "8148", "4931", "3511", "20378", "11654", "8060", "4883", "3463", "20015", "11507", "8001", "4833", "19644", "11381", "7981", "4779", "19291", "11267", "7879", "4729", "18931", "11152", "7632", "4678", "18583", "11045", "7389", "4626", "18238", "10950", "7207", "4580", "17870", "10845", "6988", "4537", "17483", "10741", "6800", "4487", "17080", "10633", "6625", "4430", "16610", "10510", "6411", "4375", "16081", "10377", "6097"];

// var xCol = ["Year", "2000", "2001", "2002", "2002", "2002", "2004", "2006", "2008", "2008", "2008", "2009", "2010", "2010", "2011", "2011", "2011", "2014", "2014", "2014", "2015"];
// var yCol = ["Volcanic explosivity index (VEI)", "4", "4", "1", "4", "4", "4", "4", "4", "4", "4", "4", "4", "4", "4", "5", "4", "2", "4", "3", "4"];



/**
 * Constants
 */

var PIXEL_RATIO;	// calculated at runtime


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
		data = $.csv.toArrays(csvData);
		
		if(data[0].length < 2) {
			alert("Error reading " + files[0].name + ": File must contain at least 2 data columns");
			var form = document.getElementById("file-upload-form");
			form.reset();
		} else {
			// render data in #data-table
			fillDataTable(data);
		}
	};
}

function cleanColumns(xCol, yCol) {
	// get number of cells from longest array
	var nCells = Math.max(xCol.length, yCol.length);
	
	// initialise ambiguity array
	var ambiguity = Array();
	
	var defaultValueFactor = 0.5;
	var mergedHeaderFactor = 0.5;
	var unknownFactor = 1;
	
	for (i = nCells-1; i > 0; i--) {	// begin at end of array to simplify array splicing
		ambiguity[i] = 0;
		
		// check for empty cells
		var isXEmpty = (xCol[i] == "" || xCol[i] == null || xCol[i] == undefined);
		var isYEmpty = (yCol[i] == "" || yCol[i] == null || yCol[i] == undefined);
		
		if (isXEmpty && isYEmpty) {	// if both are empty
			xCol.splice(i, 1);		// remove from array (generates no ambiguity)
		} else {
			if (isXEmpty) {			// if only one is empty
				xCol[i] = "0";		// default to 0
				ambiguity[i] += defaultValueFactor;
			} else if (isYEmpty) {
				yCol[i] = "0";
				ambiguity[i] += defaultValueFactor;
			}
			
			// check for non-numeric cells
			var isXNumeric = ($.isNumeric(xCol[i].replace(',', '').replace(' ', '')));
			var isYNumeric = ($.isNumeric(yCol[i].replace(',', '').replace(' ', '')));
			
			if (!isXNumeric && !isYNumeric) {	// if both are not numeric (e.g. strings)
				xCol[0] += " " + xCol[i];		// merge with header cells
				yCol[0] += " " + yCol[i];
				ambiguity += mergedHeaderFactor;
			} else if (isXNumeric && !($.isNumeric(xCol[i]))) {			// if a cell can be made numeric by removing commas and spaces
				xCol[i] = xCol[i].replace(',', '').replace(' ', '');	// then do that
			} else if (isYNumeric && !($.isNumeric(yCol[i]))) {
				yCol[i] = yCol[i].replace(',', '').replace(' ', '');
			} else {							// if only one cell is numeric, the other can't be empty (already checked)
				ambiguity[i] += unknownFactor;	// don't know what to do => max out ambiguity
			}
		}
	}
	
	// returns ambiguity values for each row, used to highlight uncertainty in confirmation table
	return ambiguity;
}

function fillDataTable(data) {
	$.each(data, function(i, rows) {
		var tr = $(document.createElement("tr")).attr("id", "row-"+i);
		$("#data-table tbody").append(tr);
		
		$.each(rows, function(j, dat) {
			var td = $(document.createElement("td")).attr("data-col", j)
													.html(document.createElement("span"));
			if (j == 0) {
				$(td).addClass("selected-x");
			} else if (j == 1) {
				$(td).addClass("selected-y");
			}
			
			$(td).children().text(dat);
			$("#data-table #row-"+i).append(td);
		});
	});
	
	$("#data-table").data("now-selecting", "0");
	
	// show table
	$("#data-table-overlay").fadeIn();
	$("#data-table").fadeIn();
	$("#data-table-submit").fadeIn();
	$("#data-table-buttons").fadeIn();
}

function submitDataTable() {
	// get column selections
	saveColSelection("x");
	saveColSelection("y");
	
	// clean columns
	var ambiguity = cleanColumns(xCol, yCol);
	Math.max.apply(Math, ambiguity);
	
	// close #data-table
	$("#data-table-overlay").fadeOut(300);
	$("#data-table").fadeOut(300);
	$("#data-table-submit").fadeOut(300);
	$("#data-table-buttons").fadeOut(300);
	
	// draw results on timeline
	drawToCanvas(xCol, yCol);
	
	// empty #data-table and reset buttons
	setTimeout(function() {
		$("#data-table-buttons a.active").removeClass("active");
		$("#data-table tbody").empty();
	}, 300);
}

function saveColSelection(axis) {	// axis = "x" or "y"
	var $selected = $("#data-table td.selected-" + axis);	// class = "selected-x" or "selected-y"
	
	switch (axis) {
		case "x":
			xCol = $selected.children().contents();
			$.each(xCol, function(i, x) { xCol[i] = x.data; });
			break;
		case "y":
			yCol = $selected.children().contents();
			$.each(yCol, function(i, y) { yCol[i] = y.data; });
			break;
		default:
			console.log("Invalid parameter: saveColSelection() must receive either 'x' or 'y'");
			return false;
			break;
	}
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

function drawToCanvas(xCol, yCol) {
	// clear canvas before redrawing
	context.clearRect(-PADDING_CANVAS, topY - PADDING_CANVAS, canvas.width, canvas.height);
	
	// TODO: Determine time axis type (years, days, timestamps, ...)
	
	// determine x and y axis periods
	var xMinMax = getMinMax(xCol.slice(1, xCol.length));
	var yMinMax = getMinMax(yCol.slice(1, yCol.length));
	var deltaX = xMinMax[1] - xMinMax[0];
	var deltaY = yMinMax[1] - yMinMax[0];
	
	var xPeriod = Math.ceil(rightX/(deltaX + 2));
	var yPeriod = Math.ceil(-midY/(deltaY + 2));
	
	// correct periods
	if (xPeriod < MIN_X_PERIOD) {
		var newRightX = xPeriod*(deltaX + 2);
		
		$(window).off("resize");
		var newWidth = newRightX + 2*PADDING_CANVAS;
		bindWindowResize();
	}
	
	if (yPeriod < MIN_Y_PERIOD) {
		yMultiple = MIN_Y_PERIOD/yPeriod;
	} else {
		yMultiple = 1;
	}
	
	// trace content
	traceBG();															// background
	traceDataPoints(xMinMax, xPeriod, yMinMax, yPeriod);				// data points
	traceAxes();														// axes
	traceLabels();														// axis labels and graph title
	traceAxisNotation(xMinMax, xPeriod, yMinMax, yPeriod, yMultiple);	// axis subdivisions
	
	// TODO: Animate canvas elements (axes slide outwards with progressive axis notches, vertical lines rotate into circle graphs, labels fade in)
}

function getMinMax(col) {
	var min = Math.min.apply(Math, col);
	var max = Math.max.apply(Math, col);
	
	return Array(min, max);
}

function resizeCanvas() {
	// reset origin and pixel ratio before resizing
    context.setTransform(PIXEL_RATIO, 0, 0, PIXEL_RATIO, 0, 0);
    
	// set canvas dimensions
	var w = Math.max(canvas.width, $(window).width());
	var h = ($(window).height() - $("header").outerHeight(true));
	
	canvas.width = PIXEL_RATIO * w;
	canvas.height = PIXEL_RATIO * h;
	canvas.style.width = w + "px";
	canvas.style.height = h + "px";
	
	// update axis variables
	updateAxisPoints();
	
	// set canvas origin to bottom-left corner
	context.translate(PADDING_CANVAS, Math.floor(canvas.height - PADDING_CANVAS));
	
	// draw on canvas
	if (xCol.length >= 2) {
		drawToCanvas(xCol, yCol);
	}
}

function updateAxisPoints() {
	topY = Math.floor(-canvas.height + 2*PADDING_CANVAS);
	midY = Math.floor(topY/2);
	
	rightX = Math.floor(canvas.width - 2*PADDING_CANVAS);
	midX = Math.floor(rightX/2);
}

function traceBG() {
	context.rect(-PADDING_CANVAS, PADDING_CANVAS, canvas.width, -canvas.height);
	context.fillStyle = COLOR_BG;
	context.fill();
}

function traceDataPoints(xMinMax, xPeriod, yMinMax, yPeriod) {
	// generate data colours
	var yColours = generateColours(yCol.length - 1);
	
	// trace each data point
	for (k=1; k<yCol.length; k++) {
		// get period multipliers
		x = xCol[k] - xMinMax[0];
		y = yCol[k] - yMinMax[0];
		
		var path = new Path2D();
//		path.moveTo(40 + (x+1)*xPeriod, 0);
//		path.lineTo(40 + (x+1)*xPeriod, -y*yPeriod);
		path.arc((x+1)*xPeriod, midY, y*yPeriod, 0, Math.PI*2, false);
		context.fillStyle = yColours[k];
		context.fill(path);
	}
}

function traceAxes() {
	// plot horizontal axis
	var axisX = new Path2D();
	axisX.moveTo(0, midY);				// axis line
	axisX.lineTo(rightX, midY);
	axisX.moveTo(rightX - 5, midY - 5);	// axis arrow
	axisX.lineTo(rightX, midY);
	axisX.lineTo(rightX - 5, midY + 5);
	
	// plot vertical axis
	var axisY = new Path2D();
	axisY.moveTo(0, 0);			// axis line
	axisY.lineTo(0,	topY);
	axisY.moveTo(-5, topY + 5);	// axis arrow
	axisY.lineTo(0,	topY);
	axisY.lineTo(5, topY + 5);
	
	// set line style
	context.strokeStyle = COLOR_AXIS;
	context.lineWidth = LINE_WIDTH_AXIS;
	context.lineCap = "round";
	
	// trace axes
	context.stroke(axisX);
	context.stroke(axisY);
}

function traceLabels() {
	var xlabel = xCol[0];
	var ylabel = yCol[0];
	var title = ylabel + " by " + xlabel + "";
	
	// add axis labels
	context.font = FONT_STR_AXIS_LABELS;
	context.fillStyle = COLOR_AXIS;
	
	context.textAlign = "right";
	context.fillText(xlabel, rightX, midY - 15);
	
	context.textAlign = "left";
	context.fillText(ylabel, 15, topY + FONT_SIZE_GLOBAL);
	
	// add title
	context.font = FONT_STR_TITLE;
	context.fillStyle = COLOR_TITLE;
	context.textAlign = "center";
	
	var titleWidth = context.measureText(title).width;
	
	if (titleWidth > (canvas.width - PADDING_CANVAS*3)) {
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
		
		while (titleWidth > (canvas.width - PADDING_CANVAS*3) && shrinkFactor > 0.5) {
			shrinkFactor *= 0.75;
			context.font = "bold " + FONT_SIZE_TITLE*shrinkFactor + "px " + FONT_FACE_GLOBAL;
			
			titleWidth = Math.max(context.measureText(title[0]).width, context.measureText(title[1]).width);
		}
		
		context.fillText(title[0], midX, topY + 2*FONT_SIZE_TITLE*(Math.sqrt(shrinkFactor)));
		context.fillText(title[1], midX, topY + 2*FONT_SIZE_TITLE*(Math.sqrt(shrinkFactor)) + 1.5*FONT_SIZE_TITLE*shrinkFactor);
	} else {
		context.fillText(title, midX, topY + 2*FONT_SIZE_TITLE);
	}
}

function traceAxisNotation(xMinMax, xPeriod, yMinMax, yPeriod, yMultiple) {
	// TODO: Fix edge-case where x or y values begin at 0 (set 0 at origin, not separate notch)
	// TODO: Set max amount of data points (if above threshold, use only every nth data where n = ceil(threshold/nData) )
	
	// notate axes
	context.font = FONT_STR_AXIS_SUBDIVS;
	context.fillStyle = COLOR_AXIS;
	
	// notate x axis
	for (i=0; i <= (xMinMax[1] - xMinMax[0]); i++) {
		var notch = new Path2D();
		var x = (i+1)*xPeriod;
		
		notch.moveTo(x, midY - 6);
		notch.lineTo(x, midY + 6);
		context.stroke(notch);
		
		context.textAlign = "center";
		context.fillText(xMinMax[0] + i, x, midY + 2*FONT_SIZE_AXIS_SUBDIVS);
	}
	
	// notate y axis
	for (j=yMinMax[0]; j <= yMinMax[1] - yMinMax[0]; j++) {
		j *= yMultiple;
		
		var notch = new Path2D();
		var yPos = midY - (j + yMultiple)*yPeriod;
		var yNeg = midY + (j + yMultiple)*yPeriod;
		
		notch.moveTo(-5, yPos);	// positive values
		notch.lineTo(5, yPos);
		notch.moveTo(-5, yNeg);	// negative values
		notch.lineTo(5, yNeg);
		context.stroke(notch);
		
		context.textAlign = "right";
		context.fillText(yMinMax[0] + j, -FONT_SIZE_GLOBAL, yPos + 5);
		context.fillText(yMinMax[0] + j, -FONT_SIZE_GLOBAL, yNeg + 5);
	}
}


/**
 * Runtime
 */

$(document).ready(function() {
	// TODO: Add manual data entry table
	
	// calculate PIXEL_RATIO
	PIXEL_RATIO = (function () {
	    var ctx = document.createElement("canvas").getContext("2d"),
	        dpr = window.devicePixelRatio || 1,
	        bsr = ctx.webkitBackingStorePixelRatio ||
	              ctx.mozBackingStorePixelRatio ||
	              ctx.msBackingStorePixelRatio ||
	              ctx.oBackingStorePixelRatio ||
	              ctx.backingStorePixelRatio || 1;
	
	    return dpr / bsr;
	})();
	
	// update canvas.cfg.js sizes
	updateCfgSizes(PIXEL_RATIO);
	
	// get canvas and set dimensions
	canvas = document.getElementById('timeline');
	
	if(canvas.getContext) {	// check if browser supports canvas API
		context = canvas.getContext('2d');
		resizeCanvas();
		
		// listen for file upload changes
		var fileInput = document.getElementById("file-upload");
		fileInput.addEventListener("change", handleFile, false);
		
		// bind data table submit button
		$("#data-table-submit").on("click", function(event) {
			event.preventDefault();
			submitDataTable();
		});
		
		// bind data table x-column button
		$("#data-table-buttons #x-picker").on("click", function(event) {
			event.preventDefault();
			toggleTableSelection("x");
		});
		
		// bind data table y-column button
		$("#data-table-buttons #y-picker").on("click", function(event) {
			event.preventDefault();
			toggleTableSelection("y");
		});
	}
	else {
		// TODO: fallback code
		$("#timeline").css({
			"width": "100%",
			"min-height": "130px"
		});
	}
	
	// resize canvas on window resize
	bindWindowResize();
});
