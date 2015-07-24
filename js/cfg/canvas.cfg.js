/**
 * File			js/cfg/canvas.cfg.js
 * Author		Eric Seguin
 * Last mod		23 July 2015
 * Description	Configuration values for timeline style
 */

/**
 * Colours
 */

var axisColour = "#2a2a2a";		// axis & notation colour
var titleColour = "#2a2a2a";	// timeline title colour

var timelineStartColour = "#FF0000";	// starting colour on timeline plot points gradient (hexadecimal values only)
var timelineEndColour = "#0000FF";		// ending colour on timeline plot points (hexadecimal values only)
var timelineOpacity = 0.35;				// timeline plot point opacity (values between 0 and 1)


/**
 * Spacing & dimensions
 */

var timelinePadding = 40;	// outer timeline padding

var axisThickness = 2;		// axis line thickness


/**
 * Fonts
 */

var baseFontFace = "Open Sans";	// global font face
var baseFontSize = 14;			// global font size

var axisValueFontSize = 0.8*baseFontSize;							// axis value font size
var axisValueFontStr = axisValueFontSize + "px " + baseFontFace;	// font on axis values

var axisLabelFontSize = 1.15*baseFontSize;									// axis label font size
var axisLabelFontStr = "bold " + axisLabelFontSize + "px " + baseFontFace;	// font on axis labels

var titleFontSize = 2*baseFontSize;									// timeline title font size
var titleFontStr = "bold " + titleFontSize + "px " + baseFontFace;	// timeline title font

