/**
 * File			js/visualisr.js
 * Author		Eric Seguin
 * Last mod		24 July 2015
 * Description	Open-source CSV-to-graph webapp built using JavaScript and the HTML5 Canvas API. 
 */

(function() {
	var root = this;
	var mainObj;
	
	// Claim global variable Visualisr as base class
	Visualisr = function(canvas) {
		// Give global access to this object
		mainObj = this;
		
		// Get canvas
		this.context = context;
		this.canvas = context.canvas;
		
		// Model objects
		this.table = new Visualisr.Table();
		this.plotData = new Visualisr.PlotData();
		this.graph = new Visualisr.Graph(this.context);
		
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
			
			// Draw graph using current plotData values
			this.redraw();
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
			this.graph.period.x = Math.ceil(this.graph.axisPts.maxX/(this.plotData.xAttr.delta + 2));
			this.graph.period.y = Math.ceil(-this.graph.axisPts.midY/(this.plotData.yAttr.delta + 2));
			
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
		 * Draws everything in plotData on the canvas.
		 */
		redraw: function() {
			// Check if plotData.title is a non-empty string. If valid, draw it.
			if (typeof mainObj.plotData.title === "string" && mainObj.plotData.title.length > 0) {
				this.draw.title();
			}
			
			// Check if plotData.pts contains points. If so, draw them.
			if (mainObj.plotData.pts.length > 0) {
				this.draw.points();
			}
			
			// Draw basic graph elements
			this.draw.axes();
			this.draw.labels();
		},
		
	};
	
	Visualisr.prototype.draw = {
		
		title: function() {
			// Get title
			var title = Array();
			title[0] = mainObj.plotData.title;
			
			context.font = global.font.title;
			context.fillStyle = defaults.color.title;
			context.textAlign = "center";
			
			var titleWidth = context.measureText(title[0]).width;
			var maxWidth = mainObj.graph.canvas.width - 3*defaults.layout.padding;
			
			if (titleWidth > maxWidth) {
				// If title is too wide, apply transformations to make it fit
				var titleWords = title[0].split(" ");
				var nWords = Math.ceil(titleWords.length/2);
				
				// First, split title into two lines
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
				
				// Try measuring again. If still too large, apply a scaling factor (we don't want more than 2 lines)
				titleWidth = Math.max(context.measureText(title[0]).width, context.measureText(title[1]).width);
				var shrinkFactor = 1;
				
				while (titleWidth > maxWidth && shrinkFactor > 0.5) {	// While title is too big
					shrinkFactor *= 0.75;	// Multiply scaling factor by 0.75 on each iteration
					context.font = "bold " + defaults.font.titleSize*shrinkFactor + "px " + defaults.font.face;
					
					titleWidth = Math.max(context.measureText(title[0]).width, context.measureText(title[1]).width);
				}
				
				// Set title height
				global.display.titleHeight = 2 * defaults.font.titleSize * Math.sqrt(shrinkFactor);
			} else {  // If title isn't too wide, draw it without modification
				// Set title height
				global.display.titleHeight = defaults.font.titleSize;
			}
				
			// Update axis points and clear graph
			mainObj.graph.updateAxisPts();
			mainObj.graph.clear();
			
			// Add title
			var titleHeight = global.display.titleHeight;
			var x = mainObj.graph.axisPts.midX;
			var y = mainObj.graph.axisPts.maxY - titleHeight;
			
			for (i=0; i < title.length; i++) {
				context.fillText(title[i], x, y + i*0.6*titleHeight);
			}
		},
		
		/**
		 * Method: draw.points()
		 * Draws all valid points in mainObj.plotData onto graph
		 */
		points: function() {
			// Generate plot colours
			var colours = util.generateColors(mainObj.plotData.pts.length);
			
			// Get x and y periods each time drawPoints() is called to make sure they're up to date
			mainObj.getPeriod();
			
			// Draw each point
			for (i = 0; i < mainObj.plotData.pts.length; i++) {
				// Get position relative to the minimum (first notch on the axis)
				x = mainObj.plotData.pts[i].x - (mainObj.plotData.xAttr.min - 1);
				y = mainObj.plotData.pts[i].y - (mainObj.plotData.yAttr.min - 1);
				
				// Draw point as circle with radius = y value
				var pt = new Path2D();
				pt.arc(
					x * mainObj.graph.period.x,	// x position
					mainObj.graph.axisPts.midY,	// y position
					y * mainObj.graph.period.y,	// radius
					0,							// start angle
					Math.PI*2,					// end angle
					false						// go anticlockwise?
				);
				
				context.fillStyle = colours[i];
				context.fill(pt);
			}
		},
		
		/**
		 * Method: draw.axes()
		 * Draws axes onto graph
		 */
		axes: function() {
			var maxX = mainObj.graph.axisPts.maxX;
			var maxY = mainObj.graph.axisPts.maxY;
			var midY = mainObj.graph.axisPts.midY;
			
			// plot horizontal axis
			var axisX = new Path2D();
			
			axisX.moveTo(-15,		midY);	// axis line
			axisX.lineTo(maxX,	midY);
			
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
			context.strokeStyle = defaults.color.axis;
			context.lineWidth = defaults.layout.axisWidth;
			context.lineCap = "round";
			
			// trace axes
			context.stroke(axisX);
			context.stroke(axisY);
		},
		
		/**
		 * Method: draw.labels()
		 * Draws axis labels onto graph
		 */
		labels: function() {
			var xlabel = mainObj.plotData.xlabel;
			var ylabel = mainObj.plotData.ylabel;
			
			// add axis labels
			context.font = global.font.axisLabel;
			context.fillStyle = defaults.color.axis;
			
			context.textAlign = "right";
			context.fillText(xlabel, mainObj.graph.axisPts.maxX, mainObj.graph.axisPts.midY - 15);
			
			context.textAlign = "left";
			context.fillText(ylabel, 15, mainObj.graph.axisPts.maxY + defaults.font.axisLabelSize);
		},
		
	};
	
	// Default appearance options described in the docs. Users can configure these to their <3's desire
	// by calling Visualisr.defaults.something = value
	var defaults = Visualisr.defaults = {
		
		global: {
			scaleAll: 1.0,			// scale factor on all canvas elements
			fillParent: false,		// if true, resize canvas to fill its parent element
		},
		
		color: {
			bg: "#f9f9f9",		// canvas background colour
			
			borderColor: "#ccc",	// canvas border colour
			borderType: "solid",	// canvas border type
			
			axis: "#afafaf",		// axis & notation colour
			title: "#999",	// timeline title colour
			
			bubblesStart: "#0055FF",	// leftmost colour on plot points gradient (hexadecimal values only)
			bubblesEnd: "#FF0055",		// rightmost colour on plot points gradient (hexadecimal values only)
			bubblesOpacity: 0.35,		// plot point opacity (between 0 and 1)
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
			minPeriodX: 50,	// minimum spacing between x-axis subdivisions
			minPeriodY: 30,	// minimum spacing between y-axis subdivisions
		}
	
	};
	
	// Global variables
	var global = Visualisr.global = {
		
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
	 * Class: DataAttr(x,y)
	 * Contains various attributes of a column in the internal data table (min value, max value, the
	 * difference between them, and an estimation of the average distance between adjacent values)
	 */
	var DataAttr = Visualisr.DataAttr = function() {
		this.min = 0;
		this.max = 0;
		this.delta = 0;
		this.avgDistance = 0;
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
		 * Method: this.push(pair)
		 * Interprets a pair of values of any type and adds it to appropriate part of PlotTable
		 * 
		 * Arguments:
		 * 		- pair: A pair of values of arbitrary type
		 */
		push: function(pair) {
			// Attempt to interpret strings as numbers
			x = processNumString(pair.x);
			y = processNumString(pair.y);
			
			var typeStr = $.type(x) + " " + $.type(y);	// e.g. "string number"
			
			switch (typeStr) {
				case "number number":
					var pair = new Pair(x,y);
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
					var pair = new Pair(x,y);
					this.pts.push(pair);
					this.ambig.push(1);
					this.size++;
					break;
			}
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
		
		/**
		 * Method: this.pushPoints(points)
		 * Add a point or an array of points to the end of the internal pts array
		 * 
		 * Arguments:
		 * 		- point: A pair/an array of pairs of numeric values representing a point on the graph
		 */
		pushPoints: function(points) {
			for (i=0; i < points.length; i++) {
				this.pts.push(points[i]);
			}
		},
		
		/**
		 * Method: this.getAttr()
		 * Get two DataAttr() objects representing the attributes of the x and y values in the
		 * internal pts array
		 */
		getAttr: function() {
			var xMin = xMax = this.pts[0].x;	// assign initial values to min, max
			var yMin = yMax = this.pts[0].y;
			
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
		},
	};
	
	/**
	 * Class: Graph()
	 * One of the three model classes. It represents and handles the graph itself, i.e. the most
	 * frontend portion of the app. It stores the canvas attributes and has methods to control
	 * the display of the graph on the page.
	 */
	Graph = Visualisr.Graph = function(context) {
		// Context
		this.context = context;
		this.canvas = context.canvas;
		
		// Layout
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
			if (global.display.pixelRatio != 1) {
				var ratio = global.display.pixelRatio/1.5;
				
				defaults.layout.padding *= ratio;
				defaults.layout.axisWidth *= ratio;
				defaults.layout.minPeriodX *= ratio;
				defaults.layout.minPeriodY *= ratio;
				
				defaults.font.scaleText *= ratio;
			}
		},
		
		/**
		 * Method: this.clear()
		 * Clears the entire graph. Useful before a complete graph redraw.
		 */
		clear: function() {
			// Save canvas state, then apply identity matrix
		    this.context.save();
		    this.context.setTransform(1, 0, 0, 1, 0, 0);
		    
		    // Clear
			context.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
			
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
			var pixelRatio = global.display.pixelRatio;
		    
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
			var rwait = 400;
			
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
					mainObj.redraw();
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
		
		    global.display.pixelRatio = dpr / bsr;
		},
		
		/**
		 * Method: this.makeFontStrings()
		 * Build font strings from values in defaults.font. Uses the global font face for
		 * all text and the global scale factor to adjust font size.
		 */
		makeFontStrings: function() {
			// axis notation font
			var axisSize = defaults.font.axisSize;
			global.font.axis = axisSize + "px " + defaults.font.face;
			
			// axis label font
			var axisLabelSize = defaults.font.axisLabelSize;
			global.font.axisLabel = "bold " + axisLabelSize + "px " + defaults.font.face;
			
			// graph title font
			var titleSize = defaults.font.titleSize;
			global.font.title = "bold " + titleSize + "px " + defaults.font.face;
		},
		
		/**
		 * Method: this.onWindowResize(handler, arguments)
		 * Add event listener to window resize event and bind it to a given handler
		 * 
		 * Arguments:
		 * 		- handler: Function to run on window resize
		 */
		
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
			defaults.layout.minPeriodX *= scale;
			defaults.layout.minPeriodY *= scale;
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
			
			// Reset canvas transforms
			this.context.setTransform(1, 0, 0, 1, 0, 0);
			
			// Get axis points
			this.axisPts.maxX = Math.floor(this.canvas.offsetWidth - 2*padding);
			this.axisPts.maxY = Math.floor(-this.canvas.offsetHeight + 2*padding) + 1.5*global.display.titleHeight;
			this.axisPts.midX = Math.floor(this.axisPts.maxX/2);
			this.axisPts.midY = Math.floor(this.axisPts.maxY/2);
			
			// Set canvas origin to midY, leftX and apply pixel ratio scale
			var pixelRatio = global.display.pixelRatio;
			var padding = defaults.layout.padding;
			
			this.context.setTransform(
				pixelRatio, 0,		 0,
				pixelRatio, padding, Math.floor(this.canvas.height - padding)
			);
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
	
	
	/**
	 * Canvas functions
	 */
	
	
	
	function drawToCanvas() {
		// clear canvas before redrawing
		context.clearRect(-PADDING_OUTER, axisPts.maxY - PADDING_OUTER, canvas.width, canvas.height);
		
		// TODO: Determine time axis type (years, days, timestamps, ...)
		
		// determine x and y axis attributes & periods
		plotData.getAttr();
		
		// trace content
		traceDataPoints(plotData.xAttr, plotData.yAttr);	// data points
		traceAxes();										// axes
		traceLabels();										// axis labels
		traceTitle();										// graph title
		traceAxisNotation(plotData.xAttr, plotData.yAttr);	// axis subdivisions
		
		// TODO: Animate canvas elements (axes slide outwards with progressive axis notches, vertical lines rotate into circle graphs, labels fade in)
	}
	
	function traceAxisNotation(xAttr, yAttr) {
		// TODO: Fix edge-case where x or y values begin at 0 (set 0 at origin, not separate notch)
		// TODO: Set max amount of data points (if above threshold, use only every nth data where n = ceil(threshold/nData) )
		
		// notate axes
		context.font = FONT_STR_AXIS_SUBDIVS;
		context.fillStyle = COLOR_AXIS;
		
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

	this.Visualisr = Visualisr;
	
}).call(this);