/**
 * File			js/cfg/Graph.cfg.js
 * Author		Eric Seguin
 * Last mod		24 July 2015
 * Description	Configuration values for Graph class
 */

/**
 * Colours
 */

var COLOR_BG = "#222";			// canvas background colour
var COLOR_AXIS = "#ccc";		// axis & notation colour
var COLOR_TITLE = "#f0f0f0";	// timeline title colour

var COLOR_GRAPH_START = "#0055FF";	// leftmost colour on plot points gradient (hexadecimal values only)
var COLOR_GRAPH_END = "#FF0055";	// rightmost colour on plot points gradient (hexadecimal values only)
var OPACITY_GRAPH = 0.35;			// plot point opacity (between 0 and 1)


/**
 * Spacing & dimensions
 */

var PADDING_OUTER = 40;	// canvas padding

var LINE_WIDTH_AXIS = 2;	// axis line thickness

var MIN_X_PERIOD = 50;
var MIN_Y_PERIOD = 30;


/**
 * Fonts
 */

var FONT_SIZE_GLOBAL = 14;			// global font size
var FONT_FACE_GLOBAL = "Open Sans";	// global font face

var FONT_SIZE_AXIS_SUBDIVS = 0.8*FONT_SIZE_GLOBAL;								// axis subdivision font size
var FONT_STR_AXIS_SUBDIVS = FONT_SIZE_AXIS_SUBDIVS + "px " + FONT_FACE_GLOBAL;	// font on axis values

var FONT_SIZE_AXIS_LABELS = 1.15*FONT_SIZE_GLOBAL;										// axis label font size
var FONT_STR_AXIS_LABELS = "bold " + FONT_SIZE_AXIS_LABELS + "px " + FONT_FACE_GLOBAL;	// font on axis labels

var FONT_SIZE_TITLE = 2*FONT_SIZE_GLOBAL;									// timeline title font size
var FONT_STR_TITLE = "bold " + FONT_SIZE_TITLE + "px " + FONT_FACE_GLOBAL;	// timeline title font


/**
 * Functions
 */
function updateCfgSizes(PIXEL_RATIO) {
	if (PIXEL_RATIO != 1) {
		var ratio = PIXEL_RATIO/1.5;
		
		PADDING_CANVAS *= ratio;
		
		LINE_WIDTH_AXIS *= ratio;
		
		FONT_SIZE_GLOBAL *= ratio;
		FONT_SIZE_AXIS_SUBDIVS *= ratio;
		FONT_SIZE_AXIS_LABELS *= ratio;
		FONT_SIZE_TITLE *= ratio;
		
		FONT_STR_AXIS_SUBDIVS = FONT_SIZE_AXIS_SUBDIVS + "px " + FONT_FACE_GLOBAL;
		FONT_STR_AXIS_LABELS = "bold " + FONT_SIZE_AXIS_LABELS + "px " + FONT_FACE_GLOBAL;
		FONT_STR_TITLE = "bold " + FONT_SIZE_TITLE + "px " + FONT_FACE_GLOBAL;
	}
}
