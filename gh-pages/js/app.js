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

var data = Array(),
	timeCol = ["Year", "2000", "2001", "2002", "2002", "2002", "2004", "2006", "2008", "2008", "2008", "2009", "2010", "2010", "2011", "2011", "2011", "2014", "2014", "2014", "2015"],
	dataCol = ["Volcanic explosivity (VEI)", "4", "4", "1", "4", "4", "4", "4", "4", "4", "4", "4", "4", "4", "4", "5", "4", "2", "4", "3", "4"];


/**
 * Constants
 */

var parity = ["pair", "impair"];	// associated to value = num % 2


/**
 * Functions
 */

function fillDataTable(data) {
	$.each(data, function(i, rows) {
		var tr = $(document.createElement("tr")).attr("id", "row-"+i);
		$("#data-table tbody").append(tr);
		
		$.each(rows, function(j, dat) {
			var td = $(document.createElement("td")).attr("class", "col-"+j)
													.html(document.createElement("span"));
			$(td).children().text(dat);
			$("#data-table #row-"+i).append(td);
		});
	});
}

function generateColSelectHeader(nCols) {
	var tr = $(document.createElement("tr")).attr("id", "col-select-header");
	$("#data-table tbody").prepend(tr);
	
	for (j=0; j<nCols; j++) {
		var col = $(document.createElement("th")).data("col", j);
		
		switch (j) {
			case 0:
				col.attr("id", "select-header-x");
				var img = $(document.createElement("img")).attr("src", "css/img/time.png")
														  .attr("id", "time-picker")
														  .attr("alt", "time.png")
														  .attr("title", "Select time column (x-axis)")
														  .data("selected-col", 0);
				col.html(img);
				break;
			case 1:
				col.attr("id", "select-header-y");
				var img = $(document.createElement("img")).attr("src", "css/img/data.png")
														  .attr("id", "data-picker")
														  .attr("alt", "data.png")
														  .attr("title", "Select data column (y-axis)")
														  .data("selected-col", 1);
				col.html(img);
				break;
			default:
				var span = $(document.createElement("span"));
				col.html(span);
				break;
		}
		
		// make droppable
		col.droppable({
			activeClass: "ui-state-active",
			hoverClass: "ui-state-hover",
			drop: function(event, ui) {
				ui.draggable.data("selected-col", $(this).data("col"));
				snapToMiddle(ui.draggable, $(this));
				$(this).droppable("option", "accept", ui.draggable);
			},
			out: function() {
				$(this).droppable("option", "accept", "*");
			}
		});
		
		$("#col-select-header").append(col);
	}
	
	var options = {
		revert: "invalid",
		containment: "#col-select-header",
		axis: "x",
		cursor: "move",
		create: function(){
			$(this).data('position', $(this).position());
		}
	};
	$("#time-picker").draggable(options);
	$("#data-picker").draggable(options);
}

function snapToMiddle(dragger, target) {
	var leftMove= target.position().left - dragger.data('position').left + (target.outerWidth(true) - dragger.outerWidth(true)) / 2;
	dragger.animate({left: leftMove}, {duration: 600, easing: 'easeOutBack'});
}

function handleFile() {
	var files = this.files;
	var reader = new FileReader();	// create FileReader() instance
	
	reader.readAsText(files[0]);	// read first File() object in files (a FileList() object)
	
	reader.onload = function(event) {	// get data once file is read
		console.log("Successfully read file: " + files[0].name);
		csvData = reader.result;
		
		// parse data
		data = $.csv.toArrays(csvData);
		var nCols = data[0].length;
		var nRows = data.length;
		
		if(data[0].length < 2) {
			alert("Error reading " + files[0].name + ": File must contain at least 2 data columns");
			var form = document.getElementById("file-upload-form");
			form.reset();
		} else {
			// render data in #data-table
			fillDataTable(data);
			
			// show table
			$("#data-table-overlay").fadeIn();
			$("#data-table").fadeIn();
			$("#data-table-submit").fadeIn();
			
			// add column selection header to table
			generateColSelectHeader(nCols);
		}
	};
}

function submitDataTable() {
	// get column selections
	var selTimeCol = $("#time-picker").data("selected-col");
	var selDataCol = $("#data-picker").data("selected-col");
	
	// get columns
	timeCol = $("#data-table .col-"+selTimeCol).children().contents();
	dataCol = $("#data-table .col-"+selDataCol).children().contents();
	
	$.each(timeCol, function(i, time) { timeCol[i] = time.data; });
	$.each(dataCol, function(i, datum) { dataCol[i] = datum.data; });
	
	// close and empty #data-table
	$("#data-table-overlay").fadeOut(300);
	$("#data-table").fadeOut(300);
	$("#data-table-submit").fadeOut(300);
	
	drawToCanvas(timeCol, dataCol);
	
	setTimeout(function() {
		$("#data-table tbody").empty();
	}, 300);
}

function generateDataColours(nPoints) {
	// check if cfg colours are valid hex values
	var regex = new RegExp(/^#[0-9A-F]{6}$/i);
	if (regex.test(timelineStartColour.slice(1,7))) {	// if check fails, substitute default (red)
		console.log("Invalid value in canvas.cfg.js: timelineStartColor = " + timelineStartColour);
		timelineStartColour = "#FF0000";
	}
	if (regex.test(timelineEndColour.slice(1,7))) {	// if check fails, substitute default (blue)
		console.log("Invalid value in canvas.cfg.js: timelineEndColor = " + timelineEndColour);
		timelineEndColour = "#0000FF";
	}
	
	// extract RGB values
	var start = {
		'r': parseInt(timelineStartColour.slice(1,3), 16),
		'g': parseInt(timelineStartColour.slice(3,5), 16),
		'b': parseInt(timelineStartColour.slice(5,7), 16)
	};
	var end = {
		'r': parseInt(timelineEndColour.slice(1,3), 16),
		'g': parseInt(timelineEndColour.slice(3,5), 16),
		'b': parseInt(timelineEndColour.slice(5,7), 16)
	};
	
	// generate colours and populate rgbStrings array
	var colours = Array();
	var rgbaStrings = Array();
	
	for (i=0; i<nPoints; i++) {
		// calculate intermediate colour values
		colours[0] = ((end.r - start.r)/(nPoints - 1))*i + start.r;
		colours[1] = ((end.g - start.g)/(nPoints - 1))*i + start.g;
		colours[2] = ((end.b - start.b)/(nPoints - 1))*i + start.b;
	
		// add to rgbStrings array
		rgbaStrings[i] = "rgba(" + colours[0] + "," + colours[1] + "," + colours[2] + "," + timelineOpacity + ")";
	}
	
	return rgbaStrings;
}

function drawToCanvas(timeCol, dataCol) {
	// clear canvas before redrawing
	context.clearRect(-timelinePadding, topY - timelinePadding, canvas.width, canvas.height);
	
	// TODO: Determine time axis type (years, days, timestamps, ...)
	
	// determine x and y axis periods
	var timeMinMax = getMinMax(timeCol.slice(1, timeCol.length));
	var dataMinMax = getMinMax(dataCol.slice(1, dataCol.length));
	
	var xPeriod = Math.floor(rightX/(timeMinMax[1] - timeMinMax[0] + 2));
	var yPeriod = Math.floor(-midY/(dataMinMax[1] - dataMinMax[0] + 2));
	
	// trace content
	traceDataPoints(timeMinMax, xPeriod, dataMinMax, yPeriod);		// data points
	traceAxes();													// axes
	traceLabels();													// axis labels and graph title
	traceAxisNotation(timeMinMax, xPeriod, dataMinMax, yPeriod);	// axis subdivisions
	
	// TODO: Animate canvas elements (axes slide outwards with progressive axis notches, vertical lines rotate into circle graphs, labels fade in)
}

function getMinMax(col) {
	var min = Math.min.apply(Math, col);
	var max = Math.max.apply(Math, col);
	
	return Array(min, max);
}

function resizeCanvas() {
	// reset origin before resizing
	context.translate(0, 0);
	
	// set canvas dimensions
	var canvasWidth = $(window).width();
	var canvasHeight = $(window).height() - $("header").height();
	$(canvas).attr('width', canvasWidth).attr('height', canvasHeight);
	
	// update axis variables
	updateAxisPoints();
	
	// set canvas origin to bottom-left corner
	context.translate(timelinePadding, Math.floor(canvas.height - timelinePadding));
	
	// draw on canvas
	if (timeCol.length >= 2) {
		drawToCanvas(timeCol, dataCol);
	}
}

function updateAxisPoints() {
	topY = Math.floor(-canvas.height + 2*timelinePadding);
	midY = Math.floor(topY/2);
	
	rightX = Math.floor(canvas.width - 2*timelinePadding);
	midX = Math.floor(rightX/2);
}

function traceDataPoints(xMinMax, xPeriod, yMinMax, yPeriod) {
	// generate data colours
	var dataColours = generateDataColours(dataCol.length);
	
	// trace each data point
	for (k=0; k<dataCol.length; k++) {
		// get period multipliers
		x = timeCol[k] - xMinMax[0];
		y = dataCol[k] - yMinMax[0];
		
		var path = new Path2D();
//		path.moveTo(40 + (x+1)*xPeriod, 0);
//		path.lineTo(40 + (x+1)*xPeriod, -y*yPeriod);
		path.arc((x+1)*xPeriod, midY, y*yPeriod, 0, Math.PI*2, false);
		context.fillStyle = dataColours[k];
		context.fill(path);
	}
}

function traceAxes() {
	context.clearRect(0, Math.floor(canvas.height/2 + 20), canvas.width, canvas.height);
	
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
	context.strokeStyle = axisColour;
	context.lineWidth = axisThickness;
	context.lineCap = "round";
	
	// trace axes
	context.stroke(axisX);
	context.stroke(axisY);
}

function traceLabels() {
	var xlabel = timeCol[0];
	var ylabel = dataCol[0];
	var title = ylabel + " by " + xlabel + "";
	
	// add axis labels
	context.font = axisLabelFontStr;
	context.fillStyle = axisColour;
	
	context.textAlign = "right";
	context.fillText(xlabel, rightX, midY - 15);
	
	context.textAlign = "left";
	context.fillText(ylabel, 15, topY + axisLabelFontSize);
	
	// add title
	context.font = titleFontStr;
	context.fillStyle = titleColour;
	context.textAlign = "center";
	
	context.fillText(title, midX, topY + 2*titleFontSize);
}

function traceAxisNotation(xMinMax, xPeriod, yMinMax, yPeriod) {
	// TODO: Fix edge-case where x or y values begin at 0 (set 0 at origin, not separate notch)
	// TODO: Set max amount of data points (if above threshold, use only every nth data where n = ceil(threshold/nData) )
	
	// notate axes
	context.font = axisValueFontStr;
	context.fillStyle = axisColour;
	
	// notate x axis
	for (i=0; i <= (xMinMax[1] - xMinMax[0]); i++) {
		var notch = new Path2D();
		var x = (i+1)*xPeriod;
		
		notch.moveTo(x, midY - 6);
		notch.lineTo(x, midY + 6);
		context.stroke(notch);
		
		context.textAlign = "center";
		context.fillText(xMinMax[0] + i, x, midY + 22);
	}
	
	// notate y axis
	for (j=0; j <= yMinMax[1] - yMinMax[0]; j++) {
		var notch = new Path2D();
		var yPos = midY - (j+1)*yPeriod;
		var yNeg = midY + (j+1)*yPeriod;
		
		notch.moveTo(-5, yPos);	// positive values
		notch.lineTo(5, yPos);
		notch.moveTo(-5, yNeg);	// negative values
		notch.lineTo(5, yNeg);
		context.stroke(notch);
		
		context.textAlign = "right";
		context.fillText(yMinMax[0] + j, -14, yPos + 5);
		context.fillText(yMinMax[0] + j, -14, yNeg + 5);
	}
}


/**
 * Runtime
 */

$(document).ready(function() {
	// TODO: Add manual data entry table
	
	// get canvas and set dimensions
	canvas = document.getElementById('timeline');
	
	if(canvas.getContext) {	// check if browser supports canvas API
		context = canvas.getContext('2d');
		resizeCanvas();
		
		// listen for file upload changes
		var fileInput = document.getElementById("file-upload");
		fileInput.addEventListener("change", handleFile, false);
		
		// listen for data table submit button
		$("#data-table-submit").on("click", function(event) {
			event.preventDefault();
			submitDataTable();
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
});
