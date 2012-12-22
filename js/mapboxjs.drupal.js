(function($) {

	Drupal.behaviors.bean_mapboxjs = {
		attach: function(context, settings) {

			$(settings.mapboxjs).each(function() {

				// Load a settings object with all of our map settings.
				var settings = {};
				for (var setting in this.configuration) {
					settings[setting] = this.configuration[setting];
				}

				// Load a map with the right ID and optionally add some controls.
				var map = mapbox.map(this.mapID);
				if (settings.zoomer == 1) {
					map.ui.zoomer.add();
				}
				if (settings.fullscreen == 1) {
					map.ui.fullscreen.add();
				}

				// If the map switcher ui element is included, grab it for later.
				var options = document.getElementById('map-ui');

				// If a base layer is requested, add it here before adding additional layers.
				if (settings.base_layer != '') {
					mapbox.layer().url(settings.base_layer, function(layer) {
						map.addLayer(layer);
						addMultipleLayers();
						// For the last layer loaded, center and zoom.
						// mapbox.layer(settings.tilesets[1]['url'], function(data) {
						// console.log(data);
						// map.centerzoom({ lat: data.center.lat, lon: data.center.long }, data.zoom, true);
						// })
					});
				} else {
					// Otherwise, just add our standard layers stored as Link field values.
					addMultipleLayers(); // @TODO - Test me.
				}

				// Helper function for adding our additional layers.
				function addMultipleLayers() {
					for (var i = 0; i < settings.tilesets.length; i++) {
						addIndividualLayer(i);
					}
				}

				// Helper function for adding a single layer to map.
				// @TODO - Make compositing a configuration option.
				function addIndividualLayer(num) {
					mapbox.layer().composite(false).url(settings.tilesets[num]['url'], function(layer) {
						// If "toggleable layers enabled, show in a layer switcher."
						// Based on tutorial at http://mapbox.com/mapbox.js/example/layers/
						if (settings.layer_toggle == 1) {
							var item = document.createElement('li');
							var option = document.createElement('a');
								option.href = '#';
								option.id = layer.name;
								option.className = 'active';
								option.innerHTML = settings.tilesets[num]['title'];
							option.onclick = function(e) {
								e.preventDefault();
								e.stopPropagation();
								map.getLayer(this.id).enabled ? map.getLayer(this.id).disable() : map.getLayer(this.id).enable();
								this.className = map.getLayer(this.id).enabled ? 'active' : '';
							};
							item.appendChild(option);
							options.appendChild(item);
						}
						map.addLayer(layer);
					});
				}
			});
		}
	}

})(jQuery);
