var graph;

$(document).ready(function() {
	// TODO: Add manual data entry table
	
	// get canvas and set dimensions
	var canvas = document.getElementById('timeline');
	graph = new Visualisr(canvas);
	
	if(canvas.getContext) {	// check if browser supports canvas API
		// context = canvas.getContext('2d');
		// resizeCanvas();
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
	
	// resize canvas on window resize
	bindWindowResize();
});