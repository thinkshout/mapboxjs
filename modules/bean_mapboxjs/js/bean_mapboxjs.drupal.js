(function($) {

	Drupal.behaviors.bean_mapboxjs = {
		attach: function(context, settings) {

			$(settings.bean_mapboxjs).each(function() {

				// Load a settings object with all of our map settings.
				var settings = {};
				for (var setting in this.configuration) {
					settings[setting] = this.configuration[setting];
				}

				// Load a map with the right ID and optionally add some controls and/or a base tileset.
				var map = mapbox.map(this.mapID);
				if (settings.base_layer != '') {
					base = mapbox.layer().url(settings.base_layer, function(data) {
						map.addLayer(base);
					})
				}
				if (settings.zoomer == 1) {
					map.ui.zoomer.add();
				}
				if (settings.fullscreen == 1) {
					map.ui.fullscreen.add();
				}

				// If the map switcher is included, grab it for later.
				var options = document.getElementById('map-ui');

				// Start adding our layers.
				for (var i = 0; i < settings.tilesets.length; i++) {
					addLayer(i);
				}

				// Helper function for adding layers to map.
				function addLayer(num) {
					layer = mapbox.layer().url(settings.tilesets[num]['url'], function(data) {
						// If "toggleable layers enabled, show in a layer switcher."
						// Based on tutorial at http://mapbox.com/mapbox.js/example/layers/
						if (settings.layer_toggle == 1) {
							var item = document.createElement('li');
							var option = document.createElement('a');
								option.href = '#';
								option.id = data.name;
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
					});
					map.addLayer(layer);
				}(i);

				// Center on the last loaded layer.
				// @TODO - Centering and zooming are acting wonky.
				mapbox.load(layer.url(), function(data) {
					map.center({
						lat: data.center.lat,
						lon: data.center.lon
					});
					map.zoom(data.zoom, true);
				});
			})
		}
	}

})(jQuery);
