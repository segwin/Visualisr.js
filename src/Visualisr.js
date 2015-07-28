/**
 * File			js/visualisr.js
 * Author		Eric Seguin
 * Last mod		24 July 2015
 * Description	Open-source CSV-to-graph webapp built using JavaScript and the HTML5 Canvas API. 
 */

(function() {
	// Get root (window in browser)
	var root = this;
	
	/**
	 * Object alises
	 * Variables prefixed with '__' represent objects (**not** classes) in the Visualisr instance.
	 * Used from inside one object to refer to another while staying in the Visualisr scope.
	 * 
	 * e.g. if:   graph = new Visualisr(context);
	 * 		then: __table === graph.table
	 */
	var __main,
		__table,
		__plotData,
		__graph,
		__grid;
	
	// Use global variable Visualisr as base class
	var Visualisr = function(context) {
		// Model objects
		__main = this;
		$table = this.table = new Table();
		$plotData = this.plotData = new PlotData();
		$graph = this.graph = new Graph(context);
		$grid = this.grid = new Grid();
		
		// Other properties
		this.graph.period = new Pair(0,0);
		
		// Run on construction
		this.init();
	};
	
	// Base class methods
	Visualisr.prototype = {
		
		/**
		 * Method: this.init()
		 * Sets initial canvas properties and calls initial methods
		 */
		init: function() {
			// Increment instance counter
			if (typeof Visualisr.instanceCounter !== "undefined") { Visualisr.instanceCounter++; }
			else { Visualisr.instanceCounter = 1; }
			
			// Optional functions based on config settings
			if (defaults.global.fillParent) { this.graph.fillParent(); }
		},
		
		/**
		 * Method: this.addWrapper()
		 * Adds a wrapper around the graph DOM element for other methods (e.g. the Table.addTable
		 * method, which adds a table element to that wrapper)
		 */
		addWrapper: function() {
			var wrapper = document.createElement("div");
			// TODO
		},
		
		// TODO: Extra top padding depending on whether or not title is used
		
		/**
		 * Method: this.getPeriod()
		 * Calculates the axis periods in function of the distance between this.plotData points and this.graph
		 * dimensions. Stores the result in a Pair() object called this.period
		 */
		getPeriod: function() {
			// Calculate values (+2 to delta to compensate for spacing on the upper and lower axis extremities)
			
			// TODO: Put this in drawAxis function
			// // Adjust if necessary (smaller than min period)
			// if (xAttr.period < defaults.layout.minPeriodX) {
				// var xNotchSpacing = defaults.layout.minPeriodX / xAttr.period;
				// var newWidth = xAttr.period * (xAttr.delta + 2) + 2*PADDING_OUTER;	// resize canvas width to accomodate large content
			// }
// 			
			// if (yAttr.period < defaults.layout.minPeriodY) {
				// var yMultiplier = defaults.layout.minPeriodY / yAttr.period;
			// } else {
				// var yMultiplier = 1;
			// }
		},
		
		/**
		 * Method: this.redraw()
		 * Clears the graph and redraws it based on info from __plotData and __grid.
		 */
		redraw: function() {
			console.log("Redrawing");
			this.graph.updateAxisPts();
			this.updateGrid();
			
			// Check if plotData.title is a non-empty string. If valid, draw it.
			if (typeof this.plotData.title === "string" && this.plotData.title.length > 0) {
				this.draw.title();
			}
			
			// Check if plotData.pts contains points. If so, draw them.
			if (this.plotData.pts.length > 0) {
				this.draw.points();
			}
			
			// Draw basic graph elements
			this.draw.axes();
			this.draw.axisNotation();
			this.draw.labels();
		},
		
		// TODO: Describe me
		/**
		 * Method: this.updateGrid()
		 * 
		 */
		updateGrid: function() {
			console.log(this.plotData.xAttr);
			
			// Get position of first axis subdivision
			this.grid.first.x = this.graph.axisPts.minX + defaults.layout.periodX;
			this.grid.first.y = this.graph.axisPts.minY + defaults.layout.periodY;
			
			// Get position of last axis subdivision
			this.grid.last.x = this.graph.axisPts.maxX - defaults.layout.periodX;
			this.grid.last.y = this.graph.axisPts.midY - defaults.layout.periodY;
			
			// Get number of axis subdivisions to display
			this.grid.count.x = Math.floor(this.grid.last.x / (defaults.layout.periodX));
			this.grid.count.y = Math.floor(this.grid.last.y / (defaults.layout.periodY));
			
			console.log(this.grid.count);
			
			// Avoid repeating subdivisions by limiting count to startValue - endValue
			// TODO: Implement endValue
			if (this.grid.count.x > (this.plotData.xAttr.max - defaults.graph.startValue.x)) {
				this.grid.count.x = Math.ceil(this.plotData.xAttr.max - defaults.graph.startValue.x);
			}
			
			if (this.grid.count.y > (this.plotData.yAttr.max - defaults.graph.startValue.y)) {
				this.grid.count.y = Math.ceil(this.plotData.yAttr.max - defaults.graph.startValue.y);
			}
			
			console.log(this.grid.count);
			
			// Get spacing (__grid.spacing != defaults.graph.spacing due to cumulative rounding effects)
			this.grid.spacing.x = Math.round(this.grid.last.x / this.grid.count.x);
			this.grid.spacing.y = Math.round(this.grid.last.y / this.grid.count.y);
			
			// Get period (i.e. number of data units per axis subdivision)
			// TODO: Implement automatic minimum (i.e. if lowest value >> 0, use lowest value on axis)
			if (this.plotData.pts.length > 0) {
				if (defaults.graph.endValue.x !== 0) { var maxValueX = defaults.graph.endValue.x; }
				else { var maxValueX = this.plotData.xAttr.max; }
				
				if (defaults.graph.endValue.y !== 0) { var maxValueY = defaults.graph.endValue.y; }
				else { var maxValueY = this.plotData.yAttr.max; }
				
				this.grid.period.x = (maxValueX - defaults.graph.startValue.x) / this.grid.count.x;
				this.grid.period.y = (maxValueY - defaults.graph.startValue.y) / this.grid.count.y;
			}
		},
		
	};
	
	Visualisr.prototype.draw = {
		
		// TODO: Describe me
		/**
		 * Method: draw.updateGrid()
		 * 
		 */
		title: function() {
			var context = __main.graph.context;
			
			// Get title
			var title = Array();
			title[0] = __main.plotData.title;
			
			context.font = __global.font.title;
			context.fillStyle = defaults.color.title;
			context.textAlign = "center";
			
			var titleWidth = context.measureText(title[0]).width;
			var maxWidth = __main.graph.canvas.width - 3*defaults.layout.padding;
			
			if (titleWidth > maxWidth) {
				// If title is too wide, apply transformations to make it fit
				var titleWords = title[0].split(" ");
				var nWords = Math.ceil(titleWords.length/2);
				
				// First, split title into two lines
				title[0] = "";
				title[1] = "";
				
				for (i = 0; i < nWords; i++) {
					if (i>0) { title[0] += " "; }
					title[0] += titleWords[i];
				}
				
				for (i = nWords; i < titleWords.length; i++) {
					if (i>nWords) { title[1] += " "; }
					title[1] += titleWords[i];
				}
				
				// Try measuring again. If still too large, apply a scaling factor (we don't want more than 2 lines)
				titleWidth = Math.max(context.measureText(title[0]).width, context.measureText(title[1]).width);
				var shrinkFactor = 1;
				
				while (titleWidth > maxWidth && shrinkFactor > 0.5) {	// While title is too big
					shrinkFactor *= 0.75;	// Multiply scaling factor by 0.75 on each iteration
					context.font = "bold " + defaults.font.titleSize*shrinkFactor + "px " + defaults.font.face;
					
					titleWidth = Math.max(context.measureText(title[0]).width, context.measureText(title[1]).width);
				}
				
				// Set title height
				__global.display.titleHeight = 2 * defaults.font.titleSize * Math.sqrt(shrinkFactor);
			} else {  // If title isn't too wide, draw it without modification
				// Set title height
				__global.display.titleHeight = defaults.font.titleSize;
			}
				
			// Update axis points and clear graph
			__main.graph.updateAxisPts();
			__main.graph.clear();
			
			// Add title
			var titleHeight = __global.display.titleHeight;
			var x = __main.graph.axisPts.midX;
			var y = __main.graph.axisPts.maxY - titleHeight;
			
			for (i=0; i < title.length; i++) {
				context.fillText(title[i], x, y + i*0.6*titleHeight);
			}
		},
		
		/**
		 * Method: draw.points()
		 * Draws all valid points in __main.plotData onto graph
		 */
		points: function() {
			var context = __main.graph.context;
			var plotData = __main.plotData;
			
			// Generate plot colours
			var colours = util.generateColors(__main.plotData.pts.length);
			
			// Draw each point
			for (i = 0; i < __main.plotData.pts.length; i++) {
				var pxPerUnitX = __main.grid.spacing.x / __main.grid.period.x;
				var pxPerUnitY = __main.grid.spacing.y / __main.grid.period.y;
				
				// Get position relative to the minimum (first notch on the axis)
				x = __main.plotData.pts[i].x - defaults.graph.startValue.x;
				x *= pxPerUnitX;
				y = __main.plotData.pts[i].y - defaults.graph.startValue.y;
				y *= pxPerUnitY;
				
				var ptZeroY = new Pair(x, y);
				
				// Trace bubbles
				if (defaults.graph.showBubbles) {
					this.bubble(ptZeroY, colours[i]);
				}
			
				var pt = new Pair(x, __main.graph.axisPts.midY - y);
				
				// Trace line graph
				if (defaults.graph.showLine) {
					if (i == 0) {
						var lineGraph = new Path2D();
						lineGraph.moveTo(pt.x, pt.y);
					}
					
					this.line(i, plotData.pts.length - 1, lineGraph, pt);
				}
				
				// Trace points
				if (defaults.graph.showPoints) {
					if (i == 0) {
						var pointGraph = new Path2D();
					}
					
					this.point(i, plotData.pts.length - 1, pointGraph, pt);
				}
			}
		},
		
		bubble: function(pt, colour) {
			// Draw point as circle with radius = y value
			var path = new Path2D();
			path.arc(
				pt.x,						// x position
				__main.graph.axisPts.midY,	// y position
				pt.y,						// radius
				0,							// start angle
				2*Math.PI,					// end angle
				true						// go anticlockwise?
			);
			
			__main.graph.context.fillStyle = colour;
			__main.graph.context.fill(path);
		},
		
		line: function(index, end, path, pt) {
			path.lineTo(pt.x, pt.y);
			
			if (index == end) {
				__main.graph.context.save();
				
				__main.graph.context.shadowOffsetX = 2;
				__main.graph.context.shadowOffsetY = 2;
				__main.graph.context.shadowBlur = 2;
				__main.graph.context.shadowColor = "rgba(0,0,0,0.2)";
				
				__main.graph.context.lineJoin = "round";
				__main.graph.context.lineWidth = 2;
				
				__main.graph.context.strokeStyle = defaults.color.plot;
				__main.graph.context.stroke(path);
				
				__main.graph.context.restore();
			}
		},
		
		point: function(index, end, path, pt) {
			path.moveTo(pt.x + 3, pt.y);
			path.arc(
				pt.x,		// x position
				pt.y,		// y position
				3,			// radius
				0,			// start angle
				Math.PI*2,	// end angle
				false		// go anticlockwise?
			);
			
			if (index == end) {
				__main.graph.context.save();
				
				__main.graph.context.shadowOffsetX = 2;
				__main.graph.context.shadowOffsetY = 2;
				__main.graph.context.shadowBlur = 2;
				__main.graph.context.shadowColor = "rgba(0,0,0,0.2)";
				
				__main.graph.context.fillStyle = defaults.color.plot;
				__main.graph.context.fill(path);
				
				__main.graph.context.restore();
			}
		},
		
		/**
		 * Method: draw.axes()
		 * Draws axes onto graph
		 */
		axes: function() {
			var context = __main.graph.context;
			
			var maxX = __main.graph.axisPts.maxX;
			var maxY = __main.graph.axisPts.maxY;
			var midY = __main.graph.axisPts.midY;
			
			// plot horizontal axis
			var axisX = new Path2D();
			
			axisX.moveTo(-15, midY);	// axis line
			axisX.lineTo(maxX, midY);
			
			axisX.moveTo(maxX - 5,	midY - 5);	// axis arrow
			axisX.lineTo(maxX,		midY);
			axisX.lineTo(maxX - 5,	midY + 5);
			
			// plot vertical axis
			var axisY = new Path2D();
			
			axisY.moveTo(0, 0);			// axis line
			axisY.lineTo(0,	maxY);
			
			axisY.moveTo(-5,	maxY + 5);	// axis arrow
			axisY.lineTo(0,		maxY);
			axisY.lineTo(5,		maxY + 5);
			
			// set line style
			context.save();
				
			context.shadowOffsetX = 2;
			context.shadowOffsetY = 2;
			context.shadowBlur = 2;
			context.shadowColor = "rgba(0,0,0,0.2)";
			
			context.strokeStyle = defaults.color.axis;
			context.lineWidth = defaults.layout.axisWidth;
			context.lineCap = "round";
			
			// trace axes
			context.stroke(axisX);
			context.stroke(axisY);
			
			// restore previous style
			context.restore();
		},
		
		
		axisNotation: function() {
			// TODO: Fix edge-case where x or y values begin at 0 (set 0 at origin, not separate notch)
			// TODO: Set max amount of data points (if above threshold, use only every nth data where n = ceil(threshold/nData) )
			// TODO: Do not mirror y axis; only label positive half UNLESS defaults.graph.negativeValues === true
			
			var context = __main.graph.context;
			var plotData = __main.plotData;
			
			context.font = __global.font.axis;
			context.textAlign = "right";
			context.strokeStyle = defaults.color.axis;
			context.fillStyle = defaults.color.axis;
			
			// set shadow style
			context.save();
			
			context.shadowOffsetX = 2;
			context.shadowOffsetY = 2;
			context.shadowBlur = 2;
			context.shadowColor = "rgba(0,0,0,0.2)";
			
			// Notate x axis
			for (i=1; i <= __main.grid.count.x; i++) {
				var notch = new Path2D();
				
				// Coordinates
				var x = i * __main.grid.spacing.x;
				var y = __main.graph.axisPts.midY + 2*defaults.font.axisSize;
				
				// Draw notch
				notch.moveTo(x, __main.graph.axisPts.midY - 6);
				notch.lineTo(x, __main.graph.axisPts.midY + 6);
				context.stroke(notch);
				
				// Rotate canvas for numbering (45° counterclockwise)
				var theta = Math.PI/4;
				context.rotate(-theta);
				
				// Draw number if available
				if (plotData.pts.length > 0) {
					var decimals = Math.pow(10, defaults.graph.roundAt.x);
					var number = Math.round(decimals * i * __main.grid.period.x) / decimals;
						number += defaults.graph.startValue.x;
					
					context.fillText(number, (x - y + 5)*Math.cos(theta), (x + y)*Math.sin(theta));
				}
				
				// Rotate canvas back to 0°
				context.rotate(theta);
			}
			
			// notate y axis
			for (j=1; j <= __main.grid.count.y; j++) {
				var notch = new Path2D();
				
				var x = -defaults.font.axisSize;
				var yPos = __main.graph.axisPts.midY - j*__main.grid.spacing.y;
				var yNeg = __main.graph.axisPts.midY + j*__main.grid.spacing.y;
				
				notch.moveTo(-5, yPos);	// positive values
				notch.lineTo(5, yPos);
				notch.moveTo(-5, yNeg);	// negative values
				notch.lineTo(5, yNeg);
				context.stroke(notch);
				
				// TODO: Add padding to left if numbers are too long (overlaps border)
				
				// Draw number if available
				if (plotData.pts.length > 0) {
					var decimals = Math.pow(10, defaults.graph.roundAt.x);
					var number = Math.round(decimals * j * __main.grid.period.y) / decimals;
						number += defaults.graph.startValue.y;
									
					context.fillText(number, x, yPos + 5);
					context.fillText(number, x, yNeg + 5);
				}
			}
			
			// restore context state
			context.restore();
		},
		
		/**
		 * Method: draw.labels()
		 * Draws axis labels onto graph
		 */
		labels: function() {
			var context = __main.graph.context;
			
			var xlabel = __main.plotData.xlabel;
			var ylabel = __main.plotData.ylabel;
			
			// add axis labels
			context.font = __global.font.axisLabel;
			context.fillStyle = defaults.color.axis;
			
			context.textAlign = "right";
			context.fillText(xlabel, __main.graph.axisPts.maxX, __main.graph.axisPts.midY - 15);
			
			context.textAlign = "left";
			context.fillText(ylabel, 15, __main.graph.axisPts.maxY + defaults.font.axisLabelSize);
		},
		
	};
	
	// Default options (described in the docs). Users can configure these to their <3's desire by
	// calling Visualisr.defaults.this.option = value
	var defaults = Visualisr.defaults = {
		
		global: {
			scaleAll: 1.0,			// scale factor on all canvas elements
			fillParent: false,		// if true, resize canvas to fill its parent element
		},
		
		graph: {
			roundAt: {		// determines where to round off units on the graph (10^roundAt)
				x: 0,
				y: 0
			},
			
			startValue: {	// determines first value on axis
				x: 0,
				y: 0
			},
			
			endValue: {		// TODO: (implement this) determines last value on axis
				x: 0,
				y: 0
			},
			
			// Graph types
			showBubbles: false,
			showLine: false,
			showPoints: false,
		},
		
		color: {
			bg: "#f0f0f0",		// canvas background colour
			
			borderColor: "#ccc",	// canvas border colour
			borderType: "solid",	// canvas border type
			
			axis: "#000",	// axis & notation colour
			title: "#000",	// timeline title colour
			
			bubblesStart: "#0055FF",	// leftmost colour on plot points gradient (hexadecimal values only)
			bubblesEnd: "#FF0055",		// rightmost colour on plot points gradient (hexadecimal values only)
			bubblesOpacity: 0.35,		// plot point opacity (between 0 and 1)
			
			plot: "#000",	// plot colour
		},
		
		font: {
			face: "'Open Sans', sans-serif",	// global font face
			scaleText: 1.0,						// scale factor on all canvas text
			
			axisSize: 11,
			axisLabelSize: 16,
			titleSize: 28,
		},
		
		layout: {
			padding: 40,	// canvas padding
			borderSize: 5,	// canvas border size
			
			axisWidth: 2,	// axis line thickness
			
			// TODO: Change periodX, periodY to period.x and period.y 
			//		 && Move to defaults.graph
			periodX: 50,	// minimum spacing between x-axis subdivisions
			periodY: 30,	// minimum spacing between y-axis subdivisions
		}
	
	};
	
	// Global variables
	var __global = Visualisr.prototype.global = {
		
		display: {
			titleHeight: 0,
			pixelRatio: 1,
		},
		
		font: {
			axis: "",
			axisLabel: "",
			title: "",
		},
		
	};
	
	// Object containing all global utilities (methods and classes)
	var util = Visualisr.prototype.util = {
		
		// TODO: Description
		generateColors: function(nPoints) {
			startStr = defaults.color.bubblesStart;
			endStr = defaults.color.bubblesEnd;
			
			// check if cfg colours are valid hex values
			var regex = new RegExp(/^#[0-9A-F]{6}$/i);
			if (regex.test(startStr.slice(1,7))) {	// if check fails, substitute default (red)
				console.log("Invalid value in canvas.cfg.js: timelineStartColor = " + startStr);
				startStr = "#FF0000";
			}
			if (regex.test(endStr.slice(1,7))) {	// if check fails, substitute default (blue)
				console.log("Invalid value in canvas.cfg.js: timelineEndColor = " + endStr);
				endStr = "#0000FF";
			}
			
			// extract RGB values
			var start = {
				'r': parseInt(startStr.slice(1,3), 16),
				'g': parseInt(startStr.slice(3,5), 16),
				'b': parseInt(startStr.slice(5,7), 16)
			};
			var end = {
				'r': parseInt(endStr.slice(1,3), 16),
				'g': parseInt(endStr.slice(3,5), 16),
				'b': parseInt(endStr.slice(5,7), 16)
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
				rgbaStrings[i] = "rgba(";
					rgbaStrings[i] += colours[0] + ",";					// R
					rgbaStrings[i] += colours[1] + ",";					// G
					rgbaStrings[i] += colours[2] + ",";					// B
					rgbaStrings[i] += defaults.color.bubblesOpacity;	// alpha
				rgbaStrings[i] += ")";
			}
			
			return rgbaStrings;
		},
		
		/**
		 * Method: util.processNumString()
		 * Takes a string for input and attempts to make it numeric. If it's a number with illegal
		 * characters (i.e. ',' and ' '), those characters are stripped. Returns input as either
		 * another string (num is non-numeric) or as a float (num is numeric).
		 * 
		 * Arguments:
		 * 		- num: String to process
		 */
		processNumString: function(num) {
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
		},
		
	};
	
	/**
	 * Class: Pair(x,y)
	 * Simple class representing a pair of values. Used to store data pairs and point coordinates.
	 * 
	 * Constructor parameters:
	 *		- x: number or string
	 *		- y: number or string
	 */
	var Pair = Visualisr.Pair = function(x,y) {
		this.x = x;
		this.y = y;
	};
	
	/**
	 * Class: DataAttr()
	 * Contains various attributes of a column in the internal data table (min value, max value, the
	 * difference between them, and an estimation of the average distance between adjacent values)
	 */
	var DataAttr = Visualisr.DataAttr = function() {
		this.min = 0;
		this.max = 0;
		this.delta = 0;
	};
	
	/**
	 * Class: Grid()
	 * Contains the spacial characteristics of the graph grid (i.e. x and y information on grid size,
	 * spacing, etc.) based on axis properties (size -> number of subdivs -> grid size)
	 */
	var Grid = Visualisr.Grid = function() {
		this.first = new Pair(0,0);		// Position of first axis subdiv
		this.last = new Pair(0,0);		// Position of last axis subdiv
		this.count = new Pair(0,0);		// Number of axis subdivs
		this.spacing = new Pair(0,0);	// Grid spacing (px)
		this.period = new Pair(0,0);	// Grid period (units)
	};
	
	/**
	 * Class: Table()
	 * One of the three model classes. It contains an internal table of data pairs and has methods to
	 * handle and store raw user input (minimal sanitisation happens at this level). If the PlotData
	 * object requests it, the Table object can ask the user to verify or re-enter faulty/ambiguous
	 * info.
	 */
	var Table = Visualisr.Table = function() {
		this.el;	// table DOM element
		this.data;	// internal table
		
		// Initialise Table object
		this.init();
	};
	
	// Table class methods
	// TODO: Add manual data entry table
	Table.prototype = {
		
		/**
		 * Method: Table.init()
		 * Creates the table DOM element and assigns initial values to the internal variables
		 */
		init: function() {
			// TODO
		},
		
		/**
		 * Method: Table.addElement()
		 * Adds a new table element in the graph wrapper element
		 */
		addElement: function() {
			// TODO
		},
		
		/**
		 * Method: Table.generateTable()
		 * Loops through internal data table and renders it on page so the user can view it, make changes,
		 * and select the data to show on the graph.
		 */
		generateTable: function() {
			// Empty previous table and add <tbody> element
			var tbody = document.createElement("tbody");
			this.el.innerHTML = tbody;
			
			// Get <tbody> element
			var body = this.el.getElementsByTagName("tbody")[0];
			
			// fill table cell by cell
			for (i=0; i < this.data.length; i++) {
				// Generate <tr>
				var tr = document.createElement("tr").setAttribute("id") = "row-" + i;
				body.appendChild(tr);
				
				// Get <tr> element
				var row = body.getElementsByTagName("tr")[i];
				
				for (j=0; j < this.data[i].length; j++) {
					// Generate cell
					var td = document.createElement("td");
					td.setAttribute("contenteditable") = "true";
					td.setAttribute("data-col") = j;
					
					if (j==0) {
						td.className += " selected-x";
					} else if (j==1) {
						td.className += " selected-y";
					}
					
					td.textContent = this.data[i][j];
					
					// Add cell to row
					row.appendChild(td);
				}
			}
		},
		
		/**
		 * Method: Table.save()
		 * Stores user-entered data after completing a basic check to ensure there's as much x-column
		 * data as there is y-column data.
		 */
		save: function() {
			var x = $(this.el).find("td.selected-x").contents();
			var y = $(this.el).find("td.selected-y").contents();
			
			// check that x and y have the same length
			if (x.length != y.length) {
				return (x.length - y.length);	// return number of missing Y cells
			} else {
				// store selected cells
				for (i=0; i < x.length; i++) {
					var pair = new Pair(x[i], y[i]);
					plotData.push(pair);
				}
				
				return true;
			}
			
			// TODO: Implement these somewhere
			// // reset plotData
			// plotData.init();
// 			
			// // close #data-table
			// $("#data-table-overlay").fadeOut(300);
			// $("#data-table").fadeOut(300);
			// $("#data-table-submit").fadeOut(300);
			// $("#data-table-buttons").fadeOut(300);
// 			
			// // draw results on timeline
			// drawToCanvas();
// 			
			// // empty #data-table and reset buttons
			// setTimeout(function() {
				// $("#data-table-buttons a.active").removeClass("active");
				// $("#data-table tbody").empty();
			// }, 300);
		},
		
	};
	
	/**
	 * Class: PlotData()
	 * One of the three model classes. It represents the collection of data to be plotted onto
	 * the graph. It contains an internal table of data pairs and is used to store, sanitise
	 * and handle user data input.
	 */
	var PlotData = Visualisr.PlotData = function() {
		// Plot descriptions
		this.title = "";
		this.xlabel = "x";
		this.ylabel = "y";
		
		// Plot points
		this.pts;	// array of all accepted (i.e. numeric) plot points
		this.ambig;	// ambiguity values for each saved point
		this.size;
		
		// Other attributes
		this.xAttr;
		this.yAttr;
		
		// Initialise PlotData() object
		this.init();
	};
	
	PlotData.prototype = {
		
		/**
		 * Method: this.init()
		 * Initialises/resets the PlotData object by setting internal variables
		 */
		init: function() {
			// Plot points
			this.pts = Array();		// array of all accepted (i.e. numeric) plot points
			this.ambig = Array();	// ambiguity values for each saved point
			this.size = 0;
			
			// Other attributes
			this.xAttr = new DataAttr();
			this.yAttr = new DataAttr();
		},
		
		/**
		 * Method: this.push(array)
		 * Interprets an x and y pair of any type and stores it in an appropriate part of plotData.
		 * Non-numeric pairs are also entered into this.pts, but with an ambiguity value of 1 (i.e. they
		 * won't be displayed on the graph itself)
		 * 
		 * Arguments:
		 * 		- x: (number or string) x value
		 * 		- y: (number or string) y value
		 */
		push: function(x,y) {
			// Attempt to interpret strings as numbers
			x = __main.util.processNumString(x);
			y = __main.util.processNumString(y);
			
			var typeStr = $.type(x) + " " + $.type(y);	// e.g. "string number"
			
			switch (typeStr) {
				case "number number":
					var pair = new Pair(x,y);
					this.pts.push(pair);
					this.ambig.push(0);
					this.size++;
					break;
				default:
					console.log("Unable to interpret pair: (" + x + ", " + y + ")");
					var pair = new Pair(x,y);
					this.pts.push(pair);
					this.ambig.push(1);
					this.size++;
					break;
			}
		},
		
		/**
		 * Method: this.pushPoints(points)
		 * Add a point or an array of points to the end of the internal pts array
		 * 
		 * Arguments:
		 * 		- point: A pair/an array of pairs of numeric values representing a point on the graph
		 */
		pushArray: function(points) {
			for (i=0; i < points[0].length; i++) {
				this.push(points[0][i], points[1][i]);
			}
			
			this.sort();
			this.updateAttr();
		},
		
		/**
		 * Method: this.setPoint(index, point)
		 * Add point to the internal pts array at a given index, replacing whatever value was
		 * previously set there
		 * 
		 * Arguments:
		 * 		- index: An integer representing the location of the point in the internal pts array
		 * 		- point: A pair of numeric values representing a point on the graph
		 */
		setPoint: function(index, point) {
			this.pts[index] = point;
		},
		
		// TODO: Describe
		sort: function() {
			function isAmbigZero(element, index, array) { return element === 0; }
			
			if (!this.ambig.every(isAmbigZero)) {
				console.log("Failed to sort points array: ambiguous values");
			} else {
				this.pts.sort(this.sortFunctor);
				console.log("Successfully sorted points array");
			}
		},
		
		sortFunctor: function(a, b) {
			if      (a.x < b.x) { return -1; }
			else if (a.x > b.x) { return 1; }
			else if (a.y < b.y) { return -1; }
			else if (a.y > b.y) { return 1; }
			else                { return 0; }
		},
		
		/**
		 * Method: this.updateAttr()
		 * Get two DataAttr() objects representing the attributes of the x and y values in the
		 * internal pts array
		 */
		updateAttr: function() {
			var xMin = xMax = this.pts[0].x;	// assign initial values to min, max
			var yMin = yMax = this.pts[0].y;
			
			$(this.pts).each(function(i, pair) {
				xMin = Math.min(xMin, pair.x);	// compare current pair to saved values, ovewrite if lesser
				xMax = Math.max(xMax, pair.x);	//											  ... if greater
				
				yMin = Math.min(yMin, pair.y);
				yMax = Math.max(yMax, pair.y);
			});
			
			this.xAttr.min = xMin;	// assign values
			this.xAttr.max = xMax;
			
			this.yAttr.min = yMin;
			this.yAttr.max = yMax;
			
			this.xAttr.delta = xMax - xMin;	// calculate delta
			this.yAttr.delta = yMax - yMin;
		},
	};
	
	/**
	 * Class: Graph()
	 * One of the three model classes. It represents and handles the graph itself, i.e. the most
	 * frontend portion of the app. It stores the canvas attributes and has methods to control
	 * the display of the graph on the page.
	 */
	var Graph = Visualisr.Graph = function(context) {
		// Context
		this.context = context;
		this.canvas = context.canvas;
		
		// Layout
		this.grid = new Grid();
		this.padding = defaults.layout.padding;
		this.axisPts = {
			maxX: -1,	// rightmost extremity of x axis
			maxY: -1,	// upper extremity of y axis
			midX: -1,	// middle of x axis
			midY: -1,	// middle of y axis
		};
		
		// Initialise Graph object
		this.init();
	};
	
	Graph.prototype = {
		
		/**
		 * Method: this.init()
		 * Initialises/resets the Graph object by setting internal variables and binding the
		 * window resize event to the appropriate handler
		 */
		init: function() {
			// Apply correction factor for device pixel ratio
			this.getPixelRatio();
			this.applyPixelRatio();
			
			// Apply defaults.global.scaleAll factor to layout
			this.scaleLayout();
			
			// Set canvas style
			this.canvas.style.backgroundColor = defaults.color.bg;
			this.canvas.style.border = defaults.layout.borderSize + "px " + defaults.color.borderType + " " + defaults.color.borderColor;
			
			// Build font strings
			this.scaleFont();
			this.makeFontStrings();
			
			// Get axis points
			this.updateAxisPts();
		},
		
		/**
		 * Method: this.applyPixelRatio()
		 * Scale pixel-sized elements by 1.5x the device pixel ratio.
		 */ 
		applyPixelRatio: function() {
			// Apply scaling if necessary
			if (__global.display.pixelRatio != 1) {
				var ratio = __global.display.pixelRatio / 1.5;
				
				defaults.layout.padding /= ratio;
				defaults.layout.axisWidth /= ratio;
				defaults.layout.periodX /= ratio;
				defaults.layout.periodY /= ratio;
				
				defaults.font.scaleText /= ratio;
			}
		},
		
		/**
		 * Method: this.clear()
		 * Clears the entire graph. Useful before a complete graph redraw.
		 */
		clear: function() {
			// Save canvas state, then apply identity matrix
		    this.context.save();
		    this.context.setTransform(__global.display.pixelRatio, 0, 0, __global.display.pixelRatio, 0, 0);
		    
		    // Clear
			this.context.clearRect(0, 0, this.canvas.offsetWidth, this.canvas.offsetHeight);
			
			// Restore canvas state
		    this.context.restore();
		},
		
		/**
		 * Method: this.fillParent()
		 * Resize canvas to fill parent element. Called if defaults.global.fillParent == true.
		 * 
		 * Arguments:
		 * 		- graph: Graph() object on which to apply the method (defaults to `this`)
		 */
		fillParent: function() {
			var pixelRatio = __global.display.pixelRatio;
		    
			// Get parent element dimensions
			w = this.canvas.parentElement.offsetWidth;
			h = this.canvas.parentElement.offsetHeight;
			
			// Set new canvas dimensions
			this.canvas.width = pixelRatio * w;
			this.canvas.height = pixelRatio * h;
			this.canvas.style.width = w + "px";
			this.canvas.style.height = h + "px";
			
			// Get new axis points
			this.updateAxisPts();
			
			// Bind window resize
			var graph = this;
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
				if (new Date() - rtime > rwait) {
					setTimeout(resizeEnd, rwait);
				} else {
					timeout = false;
					graph.fillParent();
					__main.redraw();
				}
			}
		},
		
		/**
		 * Method: this.getPixelRatio()
		 * Get the pixel ratio to apply to the canvas element (device pixel ratio over canvas
		 * pixel ratio)
		 */ 
		getPixelRatio: function() {
		    var ctx = document.createElement("canvas").getContext("2d"),
		        dpr = window.devicePixelRatio || 1,
		        bsr = ctx.webkitBackingStorePixelRatio ||
		              ctx.mozBackingStorePixelRatio ||
		              ctx.msBackingStorePixelRatio ||
		              ctx.oBackingStorePixelRatio ||
		              ctx.backingStorePixelRatio || 1;
		
		    __global.display.pixelRatio = dpr / bsr;
		},
		
		/**
		 * Method: this.makeFontStrings()
		 * Build font strings from values in defaults.font. Uses the global font face for
		 * all text and the global scale factor to adjust font size.
		 */
		makeFontStrings: function() {
			// axis notation font
			var axisSize = defaults.font.axisSize;
			__global.font.axis = axisSize + "px " + defaults.font.face;
			
			// axis label font
			var axisLabelSize = defaults.font.axisLabelSize;
			__global.font.axisLabel = "bold " + axisLabelSize + "px " + defaults.font.face;
			
			// graph title font
			var titleSize = defaults.font.titleSize;
			__global.font.title = "bold " + titleSize + "px " + defaults.font.face;
		},
		
		/**
		 * Method: this.scaleFont()
		 * Scale pixel-sized elements by 1.5x the device pixel ratio.
		 */ 
		scaleFont: function() {
			var scale = defaults.global.scaleAll * defaults.font.scaleText;
			
			defaults.font.axisSize *= scale;
			defaults.font.axisLabelSize *= scale;
			defaults.font.titleSize *= scale;
		},
		
		/**
		 * Method: this.scaleLayout()
		 * Scale all non-CSS canvas layout properties by the defaults.global.scaleAll factor
		 */ 
		scaleLayout: function() {
			var scale = defaults.global.scaleAll;
			
			defaults.layout.axisWidth *= scale;
			defaults.layout.axisWidth *= scale;
			defaults.layout.periodX *= scale;
			defaults.layout.periodY *= scale;
		},
		
		/**
		 * Method: this.setWidth()
		 * Changes the stored canvas width value and updates the width of the graph on the page.
		 */
		setWidth: function(w) {
			// TODO
		},
		
		/**
		 * Method: this.updateAxisPts()
		 * Calculates the important axis points in function of the current canvas dimensions
		 */
		updateAxisPts: function() {
			var padding = defaults.layout.padding;
			var pixelRatio = __global.display.pixelRatio;
			
			// Reset canvas transforms
			this.context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
			
			// Get axis points
			this.axisPts.maxX = Math.floor(this.canvas.offsetWidth - 2*padding);
			this.axisPts.midX = Math.floor(this.axisPts.maxX/2);
			this.axisPts.minX = Math.floor(padding);
			
			this.axisPts.maxY = Math.floor(this.canvas.offsetHeight + 2*padding) - 1.5*__global.display.titleHeight;
			this.axisPts.midY = Math.floor(this.axisPts.maxY/2);
			this.axisPts.minY = Math.floor(padding);
		},
		
	};
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	/**
	 * Table functions
	 */
	
	
	
	
	
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
					if ($(this).parent().attr("id") == "row-0") {	// if first row selected, select whole column
						console.log("Selecting column");
						$select = $("#data-table td[data-col='" + $(this).attr("data-col") + "']");
					} else {										// if it's just a random cell, select only that cell
						$select = $(this);
					}
					
					// Apply selection class to $select
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
	

	this.Visualisr = Visualisr;
	
}).call(this);