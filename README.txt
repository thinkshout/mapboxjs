This module provides integration with the MapBox.js map scripting library,
http://mapbox.com/mapbox.js.

Currently, the module provides the following:

* A custom entity type/bundle for defining exportable MapBox.js map presets.
* A new MapBox.js map preset field for displaying maps as fields on any entity type.

Library Installation

* Due to how mapbox.js is distributed now it is incompatible with drush make.
You will need to download the library and build the distributable files
yourself using the directions from Mapbox.JS
(https://github.com/mapbox/mapbox.js). You should end up with a mapboxjs
directory in the libraries folder with a dist directory than contains mapbox.js
mapbox.css, mapbox.ie.css, and the images directory. Libraries also requires
the CHANGELOG.md file to exist in the main mapboxjs library directory.
