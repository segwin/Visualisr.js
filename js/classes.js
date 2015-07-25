/**
 * File			js/classes.js
 * Author		Eric Seguin
 * Last mod		24 July 2015
 * Description	Namespace and classes for visualisr.js
 */


/**
 * Global namespace
 */

var vjs = vjs || {};


/**
 * Pair class
 */

vjs.Pair = function(x, y) {
	this.x = x;
	this.y = y;
};


/**
 * Table class
 */

vjs.Table = function() {
	this.data = Array();	// internal table
};

vjs.Table.Row = function() {
	// <tr> element
	this.el = document.createElement("tr");
	this.el.
	
	// dynamic attributes
	this.id;
};

vjs.Table.prototype.generateTable = function() {
	// empty previous table
	var tbody = document.createElement("tbody");
	$("#data-table").html(tbody);
	
	// fill table cell by cell
	for (i=0; i<data.length; i++) {
		var tr = $(document.createElement("tr")).attr("id", "row-"+i);
		$(TABLE_TBODY).append(tr);
		
		for (j=0; j<data[i].length; j++) {
			var td = $(document.createElement("td")).attr("data-col", j);
			
			if (j==0) {
				$(td).addClass("selected-x");
			} else if (j==1) {
				$(td).addClass("selected-y");
			}
			
			$(td).text(data[i][j]);
			$(TABLE_TBODY + " #row-" + i).append(td);
		}
	}
};

vjs.Table.prototype.updateCell = function() {
	// TODO
};


/**
 * Data attributes class
 */

vjs.DataAttr = function() {
	this.min = 0;
	this.max = 0;
	this.delta = 0;
	this.avgDistance = 0;
};


/**
 * PlotData class
 */

vjs.PlotData = function() {
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

vjs.PlotData.prototype.init = function() {
	// Plot descriptions
	this.title = "";
	this.xlabel = "";
	this.ylabel = "";
	
	// Plot points
	this.pts = Array( /* Pair point */ );			// array of all accepted (i.e. numeric) plot points
	this.ambig = Array( /* float ambigValue */ );	// ambiguity values for each saved point
	this.size = 0;
	
	// Other attributes
	this.xAttr = new vjs.DataAttr();
	this.yAttr = new vjs.DataAttr();
};

// push([*] x, [*] y): Interprets a pair of values of any type and adds it to appropriate part of PlotTable
vjs.PlotData.prototype.push = function(pair) {
	x = processNumString(pair.x);
	y = processNumString(pair.y);
	
	var typeStr = $.type(x) + " " + $.type(y);	// e.g. "string number"
	
	switch (typeStr) {
		case "number number":
			var pair = new vjs.Pair(x,y);
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
			var pair = new vjs.Pair(x,y);
			this.pts.push(pair);
			this.ambig.push(1);
			this.size++;
			break;
	}
};

// SetPoint(int i, int x, int y): Set value of point at this.pts[index] 
vjs.PlotData.prototype.setPoint = function(index, point) {
	this.pts[index] = point;
};

vjs.PlotData.prototype.getAttr = function() {
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

vjs.AxisPts = function() {
	// vertical axis
	this.maxY;
	this.midY;
	
	// horizontal axis
	this.maxX;
	this.midX;
};

vjs.AxisPts.prototype.update = function() {
	this.maxY = Math.floor(-canvas.height + 2*PADDING_OUTER);
	this.midY = Math.floor(axisPts.maxY/2);
	
	this.maxX = Math.floor(canvas.width - 2*PADDING_OUTER);
	this.midX = Math.floor(axisPts.maxX/2);
};


/**
 * Graph class
 */

vjs.Graph = function() {
	// dimensions
	this.width;
	this.height;
	this.padding = PADDING_OUTER;
};

vjs.Graph.prototype.setWidth = function(w) {
	
};
