(function($) {

	Drupal.behaviors.bean_mapboxjs = {
		attach: function(context, settings) {

			$(settings.bean_mapboxjs).each(function() {

				// Load a settings object with all of our map settings.
				var settings = {};
				for (var setting in this.configuration) {
					settings[setting] = this.configuration[setting];
				}

				// Load a map with the right ID and add some controls.
				var map = mapbox.map(this.mapID);
				if (settings.zoomer == 1) {
					map.ui.zoomer.add();
				}
				if (settings.fullscreen == 1) {
					map.ui.fullscreen.add();
				}

				// Start adding our layers.
				for (var i = 0; i < settings.tilesets.length; i++) {
					layer = mapbox.layer().url(settings.tilesets[i]['url']);
					map.addLayer(layer);
				}
				// Center on the last loaded layer.
				mapbox.load(layer.url(), function(data) {
					map.center({
						lat: data.center.lat,
						lon: data.center.lon
					});
					map.zoom(data.zoom, true);
				});
				// If "toggleable layers enabled, show in a layer switcher."
				if (settings.layer_toggle == 1) {
					var layers = document.getElementById('map-ui');
					for (var i = 0; i < map.getLayers().length; i ++) {
						var n = map.getLayerAt(i).name;
						console.log(n);
						var item = document.createElement('li');
						var layer = document.createElement('a');
							layer.href = '#';
							layer.id = n;
							layer.className = 'active';
							layer.innerHTML = settings.tilesets[i]['title'];

						layer.onclick = function(e) {
							e.preventDefault();
							e.stopPropagation();
							map.getLayer(this.id).enabled ? map.getLayer(this.id).disable() : map.getLayer(this.id).enable();
							this.className = map.getLayer(this.id).enabled ? 'active' : '';
						};
						item.appendChild(layer);
						layers.appendChild(item);
					}
				}
			})
		}
	}

})(jQuery);
