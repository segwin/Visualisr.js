# Configuration

## Changing a setting

Visualisr.js exposes a number of settings for users to play with. To change 

## List of available options

### Global

##### Visualisr.defaults.global._scaleAll_

> **Default:** 1.0 <br>
> **Possible values:** Any number greater than 0

Controls the scaling factor to apply to all graph elements. For example, setting this value to `2.0` will make everything twice as big on the graph.

  - Avoid using very large scaling factors (>50) for performance reasons.
  - Not to be confused with `Visualisr.defaults.font.scaleText`, which only scales text elements.

##### Visualisr.defaults.global._fillParent_

> **Default:** 1.0 <br>
> **Possible values:** `true` or `false`

If set to `true`, the graph's width and height will be dynamically assigned to fill its entire parent element.


### Color

##### Visualisr.defaults.color._bg_

> **Default:** `"#f9f9f9"` <br>
> **Possible values:** Any valid HTML [`<color>`](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value) string

Controls the graph's background colour.

##### Visualisr.defaults.color._borderColor_

> **Default:** `"#ccc"` <br>
> **Possible values:** Any valid HTML [`<color>`](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value) string

Controls the graph's border colour.

##### Visualisr.defaults.color._borderType_

> **Default:** `"solid"` <br>
> **Possible values:** Any valid HTML [`border-style`](https://developer.mozilla.org/en-US/docs/Web/CSS/border-style) string

Controls the graph's border type.

##### Visualisr.defaults.color._axis_

> **Default:** `"#ccc"` <br>
> **Possible values:** Any valid HTML [`<color>`](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value) string

Controls the graph's axis colour.

##### Visualisr.defaults.color._title_

> **Default:** `"#222"` <br>
> **Possible values:** Any valid HTML [`<color>`](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value) string

Controls the graph's title colour.

##### Visualisr.defaults.color._bubblesStart_

> **Default:** `"#0055FF"` <br>
> **Possible values:** Any valid HTML [`<color>`](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value) string

Controls the starting colour for the graph bubbles.

##### Visualisr.defaults.color._bubblesEnd_

> **Default:** `"#FF0055"` <br>
> **Possible values:** Any valid HTML [`<color>`](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value) string

Controls the ending colour for the graph bubbles.

##### Visualisr.defaults.color._bubbleOpacity_

> **Default:** `0.35` <br>
> **Possible values:** Any number between 0 and 1

Controls the opacity of the graph bubbles.


### Font

##### Visualisr.defaults.font._face_

> **Default:** `"'Open Sans', sans-serif"` <br>
> **Possible values:** Any valid [`font-family`](https://developer.mozilla.org/en-US/docs/Web/CSS/font-family) string

Controls the font face for all graph text.

##### Visualisr.defaults.font._scaleText_

> **Default:** `1.0` <br>
> **Possible values:** Any number greater than 0

Controls the scaling factor to apply to all text elements on the graph.

- Avoid using very large scaling factors (>50) for performance reasons.
- Not to be confused with `Visualisr.defaults.global.scaleAll`, which scales **every** element on the page, not just text.

##### Visualisr.defaults.font._axisSize_

> **Default:** `11` <br>
> **Possible values:** Any number greater than 0

Controls the font size on axis subdivision numbers.

##### Visualisr.defaults.font._axisLabelSize_

> **Default:** `16` <br>
> **Possible values:** Any number greater than 0

Controls the font size on axis labels.

##### Visualisr.defaults.font._titleSize_

> **Default:** `28` <br>
> **Possible values:** Any number greater than 0

Controls the font size on the graph title.


### Layout

##### _Visualisr.defaults.layout.padding_

> **Default:** `40` <br>
> **Possible values:** Any positive integer including 0

Controls the graph's inner padding.

##### _Visualisr.defaults.layout.borderSize_

> **Default:** `5` <br>
> **Possible values:** Any positive integer including 0

Controls the graph's border thickness.

- Set to `0` for no border

##### _Visualisr.defaults.layout.axisWidth_

> **Default:** `2` <br>
> **Possible values:** Any number greater than 0

Controls the graph's axis line thickness.

##### _Visualisr.defaults.layout.minPeriodX_

> **Default:** `50` <br>
> **Possible values:** Any number greater than 0

Controls the minimum distance between subdivisions on the x axis.

##### _Visualisr.defaults.layout.minPeriodY_

> **Default:** `30` <br>
> **Possible values:** Any number greater than 0

Controls the minimum distrance between subdivisions on the y axis.
