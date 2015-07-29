/**
 * Global variables
 */

var ctx, canv;
var timeline;


/**
 * Sample data
 */

/* Power use */
var powerUse = {
	title: "Load forecast by time of day (MW)",
	ylabel: "Predicted power demand (MW)",
	xlabel: "Time of day (hour)",
	
	data: $.csv.toArrays("1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24\n14280,13500,13030,12790,12910,13570,14950,16570,17730,18760,19760,20580,21240,21960,22400,22710,23010,22960,22350,21760,21460,20500,18630,16760"),
};

/* Volcano by death toll */
var volcanoCasualties = {
	title: "Notable volcanic eruptions (1950-2000) by death toll",  // The graph title
	xlabel: "Year",
	ylabel: "Number of casualties",

	x: [1951, 1953, 1963, 1968, 1980, 1982, 1985,  1991, 1991, 1993, 1997],
	y: [2942, 152,  1584, 87,   57,   3500, 23000, 847,  43,   9,    19],
};

volcanoCasualties.data = [volcanoCasualties.x, volcanoCasualties.y];

/* 21st century volcano sample (small) */
var volcanoVEI = {
	title: "Volcanic eruptions (2000-2015) by VEI",
	xlabel: "Year",
	ylabel: "Volcanic explosivity index (VEI)",
	
	x: ["2000", "2001", "2002", "2002", "2002", "2004", "2006", "2008", "2008", "2008", "2009", "2010", "2010", "2011", "2011", "2011", "2014", "2014", "2014", "2015"],
	y: ["4", "4", "1", "4", "4", "4", "4", "4", "4", "4", "4", "4", "4", "4", "5", "4", "2", "4", "3", "4"],
};

volcanoVEI.data = [volcanoVEI.x, volcanoVEI.y];


/* Canadian population sample (large)  */
var populationCanada = {
	title: "Estimated population of Canada, 1867 to 1977 (thousands)",
	xlabel: "Year",
	ylabel: "Population (thousands)",
	
	x: ["1955", "1930", "1905", "1880", "1954", "1929", "1904", "1879", "1953", "1928", "1903", "1878", "1977", "1952", "1927", "1902", "1877", "1976", "1951", "1926", "1901", "1876", "1975", "1950", "1925", "1900", "1875", "1974", "1949", "1924", "1899", "1874", "1973", "1948", "1923", "1898", "1873", "1972", "1947", "1922", "1897", "1872", "1971", "1946", "1921", "1896", "1871", "1970", "1945", "1920", "1895", "1870", "1969", "1944", "1919", "1894", "1869", "1968", "1943", "1918", "1893", "1868", "1967", "1942", "1917", "1892", "1867", "1966", "1941", "1916", "1891", "1965", "1940", "1915", "1890", "1964", "1939", "1914", "1889", "1963", "1938", "1913", "1888", "1962", "1937", "1912", "1887", "1961", "1936", "1911", "1886", "1960", "1935", "1910", "1885", "1959", "1934", "1909", "1884", "1958", "1933", "1908", "1883", "1957", "1932", "1907", "1882", "1956", "1931", "1906"],
	y: ["15698", "10208", "6002", "4255", "15287", "10029", "5827", "4185", "14845", "9835", "5651", "4120", "23258", "14459", "9637", "5494", "4064", "22993", "14009", "9451", "5371", "4009", "22697", "13712", "9294", "5301", "3954", "22364", "13447", "9143", "5235", "3895", "22043", "12823", "9010", "5175", "3826", "21802", "12551", "8919", "5122", "3754", "21568", "12292", "8788", "5074", "3689", "21297", "12072", "8556", "5026", "3625", "21001", "11946", "8311", "4979", "3565", "20701", "11795", "8148", "4931", "3511", "20378", "11654", "8060", "4883", "3463", "20015", "11507", "8001", "4833", "19644", "11381", "7981", "4779", "19291", "11267", "7879", "4729", "18931", "11152", "7632", "4678", "18583", "11045", "7389", "4626", "18238", "10950", "7207", "4580", "17870", "10845", "6988", "4537", "17483", "10741", "6800", "4487", "17080", "10633", "6625", "4430", "16610", "10510", "6411", "4375", "16081", "10377", "6097"],
};

populationCanada.data = [populationCanada.x, populationCanada.y];

$(document).ready(function() {
	// Graph settings
	Visualisr.defaults.layout.borderSize = 0;
	Visualisr.defaults.display.fillParent = true;
	
	Visualisr.defaults.graph.showBubbles = true;
	Visualisr.defaults.graph.showLine = true;
	Visualisr.defaults.graph.showPoints =  true;
	
	Visualisr.defaults.graph.startValue.x = 1999;
	Visualisr.defaults.graph.endValue.x = 2015;
	
	// get canvas and set dimensions
	canv = document.getElementById('timeline');
	
	ctx = canv.getContext('2d');
	timeline = new Visualisr(ctx);
	
	timeline.plotData.title = volcanoVEI.title;
	timeline.plotData.xlabel = volcanoVEI.xlabel;
	timeline.plotData.ylabel = volcanoVEI.ylabel;
	
	timeline.plotData.pushArray(volcanoVEI.data);
	
	timeline.redraw();
	
	function togglePlotType(type, toggle) {
		switch (type) {
			case "bubbles":
				timeline.settings.graph.showBubbles = toggle;
				timeline.redraw();
				break;
			case "points":
				timeline.settings.graph.showPoints = toggle;
				timeline.redraw();
				break;
			case "line":
				timeline.settings.graph.showLine = toggle;
				timeline.redraw();
				break;
			default:
				break;
		}
	}
	
	var toggleBubbles = document.getElementById("show-bubbles");
	$(toggleBubbles).on("change", function() {
		var toggle = this.checked;
		togglePlotType("bubbles", toggle);
	});
	
	var togglePoints = document.getElementById("show-points");
	$(togglePoints).on("change", function() {
		var toggle = this.checked;
		togglePlotType("points", toggle);
	});
	
	var toggleLine = document.getElementById("show-line");
	$(toggleLine).on("change", function() {
		var toggle = this.checked;
		togglePlotType("line", toggle);
	});
	
	var dataSelect = document.getElementById("select-dataset");
	$(dataSelect).on("change", function(event) {
		var selected = $(this).children(":selected").attr("id");
		var dataset;
		var start;
		var end;
		
		switch (selected) {
			case "select-volcano-casualties":
				dataset = volcanoCasualties;
				start = 1950;
				end = 2000;
				break;
			case "select-power-use":
				dataset = powerUse;
				start = 0;
				end = 24;
				break;
			case "select-population-canada":
				dataset = populationCanada;
				start = 1867;
				end = 1977;
				break;
			case "select-volcano-vei":
			default:
				dataset = volcanoVEI;
				start = 2000;
				end = 2015;
				break;
		}
	
		timeline.settings.graph.startValue.x = start;
		timeline.settings.graph.endValue.x = end;
	
		timeline.plotData.title = dataset.title;
		timeline.plotData.xlabel = dataset.xlabel;
		timeline.plotData.ylabel = dataset.ylabel;
		
		timeline.plotData.pts = Array();
		timeline.plotData.pushArray(dataset.data);
		
		timeline.redraw();
	});
// 		
	// // listen for file upload changes
	// var fileInput = document.getElementById("file-upload");
	// fileInput.addEventListener("change", handleFile, false);
// 		
	// // bind data table submit button
	// $("#data-table-submit").on("click", function(event) {
		// event.preventDefault();
		// submitDataTable();
	// });
// 		
	// // bind data table x-column button
	// $("#data-table-buttons #x-picker").on("click", function(event) {
		// event.preventDefault();
		// toggleTableSelection("x");
	// });
// 		
	// // bind data table y-column button
	// $("#data-table-buttons #y-picker").on("click", function(event) {
		// event.preventDefault();
		// toggleTableSelection("y");
	// });
});