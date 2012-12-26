(function($) {

	Drupal.behaviors.mapboxjs = {
		attach: function(context, settings) {

			$(settings.mapboxjs).each(function() {

        // @TODO - Support multiple MapBox maps on the same page.

				// Load a settings object with all of our map settings.
				var settings = {};
				for (var setting in this.configuration) {
					settings[setting] = this.configuration[setting];
				}

				// Load a map with the right ID and optionally add some controls and variables.
				var map = mapbox.map(this.mapID);
				if (settings.zoomer == 1) {
					map.ui.zoomer.add();
				}
				if (settings.fullscreen == 1) {
					map.ui.fullscreen.add();
				}
				if (settings.legend == 1) {
					map.ui.legend.add();
				}
				map.centerzoom({ lat: settings.lat, lon: settings.lon }, settings.zoom);

        // If the map base tileset switcher ui element is included, grab it for later.
        var switcher = document.getElementById('map-switcher');

				// If the map tileset toggle ui element is included, grab it for later.
				var options = document.getElementById('map-toggle');

				// Load our base tileset layer(s), then add any optional layers.
        // Mapbox.load() can accept a non-associative array of tileset layers.
				var base_tileset_urls = [];
				for (var i in settings.base_tilesets) {
          base_tileset_urls[i] = settings.base_tilesets[i]['url'];
        }
        mapbox.load(base_tileset_urls, function(data) {
          map.addLayer(data[0]['layer']);
          for (var i in data) {
            // If there is more than one base tileset, add click events.
            if (data.length > 1) {
              document.getElementById('base-tile-' + i).onclick = function(e) {
                this.className = 'active';
                //map.addLayer(data[e]['layer']);
                // @FIXME - Not sure how to handle turning on/off multiple base tilesets.
                // See example at: http://mapbox.com/mapbox.js/example/simple-filtering/.
                return false;
              };
            }
          }
          addOptionalLayers(); //FIXME - Working in Alpha1 release, but not here.
        });

				// Helper function for adding our optional layers.
				function addOptionalLayers() {
					for (var i = 0; i < settings.optional_tilesets.length; i++) {
						addIndividualOptionalLayer(i);
					}
				}

				// Helper function for adding a single optional layer to map.
				function addIndividualOptionalLayer(num) {
					var composite = true;
					if (settings.composite == '0') {
						composite = false;
					}
					mapbox.layer().composite(composite).url(settings.optional_tilesets[num]['url'], function(layer) {
						// If "toggleable layers enabled, show in a layer switcher."
						// Based on tutorial at http://mapbox.com/mapbox.js/example/layers/
						if (settings.layer_toggle == 1) {
							var item = document.createElement('li');
							var option = document.createElement('a');
								option.href = '#';
								option.id = layer.name;
								option.className = 'active';
								option.innerHTML = settings.optional_tilesets[num]['title'];
							option.onclick = function(e) {
								e.preventDefault();
								e.stopPropagation();
								map.getLayer(this.id).enabled ? map.getLayer(this.id).disable() : map.getLayer(this.id).enable();
								this.className = map.getLayer(this.id).enabled ? 'active' : '';
								map.interaction.refresh();
							};
							item.appendChild(option);
							options.appendChild(item);
						}
						map.addLayer(layer);
						map.interaction.auto();
					});
				}
			});
		}
	};

})(jQuery);
