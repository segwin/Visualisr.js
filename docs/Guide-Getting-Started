# Getting Started

(TODO: Introduction, describe what the guide's about)

### Table of Contents
1. **[Setting up a graph](#setting-up-a-graph)**
  1. **[Getting Visualisr.js](#getting-visualisrjs)**
  2. **[Initialising a graph](#initialising-a-graph)**
  3. **[Visualising data](#visualising-data)**
2. **[Making changes](#making-changes)**
  1. **[Adding/removing data](#addingremoving-data)**
  2. **[Changing the title/axis labels](#changing-the-titleaxis-labels)**
  3. **[Clearing the graph](#clearing-the-graph)**
3. **[Other goodies](#other-goodies)**

## Setting up a graph

### Getting Visualisr.js

First you'll need to [download the library](https://github.com/segwin/Visualisr.js/zipball/master). Open it and find `lib/visualisr.js`, then copy it to a directory on your site and include it on your page:

```html
<script src="/path/to/visualisr.js"></script>
```

### Initialising a graph

To add a graph to a `<canvas>` element, you'll need to create a Visualisr instance on it. The following example shows how to create a basic graph on a 400x800px canvas.

```html
<canvas id="example-graph" height="400" width="800"></canvas>
```

```js
var canvas = document.getElementById("example-graph");  // Get the canvas element
var graph = new Visualisr(canvas);                      // and create a Visualisr object on it
```

### Visualising data

With our graph now initialised, we just need to add the data we want to display. This involves defining the title and an array containing the information for each point, then using the `.visualise(data, title)` method.

```js
// Define the data to visualise
var title = "Notable volcanic eruptions (1950-2000) by death toll";  // The graph title

var data = [  // The data to display
//	x axis, y axis
	"Year", "Number of casualties",
	1951,   2942,
	1953,   152,
	1963,   1584,
	1968,   87,
	1980,   57,
	1982,   3500,
	1985,   23000,
	1991,   847,
	1991,   43,
];

// Construct the graph
graph.visualise(data, title);
```


## Making changes

### Adding data

It's possible to add one or several new data points to an existing graph using the `.addData(data)` method.

```js
// Define additional data points
var moreData = [
	1993,   9,
	1997,   19,
];

// Add the points to the graph
graph.addData(moreData);
```

### Removing data

Conversely, you can also remove existing data points by using the `.removeData(data)` method.

```js
// Define data points to remove
var dataToRemove = [
	1980,   57,
	1991,   43,
];

// Remove pointa from the graph
graph.addData(moreData);
```

### Changing the title

The graph title can be changed at any time via the `.changeTitle(newTitle)` method, like so:

```js
// Change graph title
var newTitle = "This title is different from the previous one";
graph.changeTitle(newTitle);
```

### Changing the axis labels

The axis labels are also changeable via the `.changeLabel(axis, newLabel)` method, where the `axis` argument can be either `"x"` or `"y"`.

```js
// Change x-axis label
var newLabel = "New x-axis label";
graph.changeLabel("x", newLabel);

// Change y-axis label
var newLabel = "New y-axis label";
graph.changeLabel("y", newLabel);
```

### Clearing the graph

TODO


## Other goodies

TODO