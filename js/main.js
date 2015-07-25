/**
 * Global variables
 */

var context, canvas;
var graph;


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

$(document).ready(function() {
	// TODO: Add manual data entry table
	
	//Visualisr.defaults.color.bg = "#222";
	Visualisr.defaults.color.borderColor = "transparent";
	Visualisr.defaults.global.fillParent = true;
	
	// get canvas and set dimensions
	canvas = document.getElementById('timeline');
	graph = new Visualisr(canvas);
	
	if(canvas.getContext) {	// check if browser supports canvas API
		context = canvas.getContext('2d');
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
	}
	else {
		// TODO: fallback code
		$("#timeline").css({
			"width": "100%",
			"min-height": "130px"
		});
	}
});