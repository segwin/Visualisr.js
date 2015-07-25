/**
 * File			js/classes.js
 * Author		Eric Seguin
 * Last mod		24 July 2015
 * Description	Namespace and classes for visualisr.js
 */

// Claim global variable Visualisr as namespace
var Visualisr = function() {
	
};


/**
 * Pair class
 */

Visualisr.Pair = function(x, y) {
	this.x = x;
	this.y = y;
};


/**
 * Table class
 */

Visualisr.Table = function() {
	this.data = Array();	// internal table
};

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

Visualisr.Table.prototype.updateCell = function() {
	// TODO
};


/**
 * Data attributes class
 */

Visualisr.DataAttr = function() {
	this.min = 0;
	this.max = 0;
	this.delta = 0;
	this.avgDistance = 0;
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
