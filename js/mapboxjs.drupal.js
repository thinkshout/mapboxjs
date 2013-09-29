(function ($) {

  Drupal.behaviors.mapboxjs = {
    attach:function (context, settings) {
      for (var mapid in settings.mapboxjs) {
        var mapObj = settings.mapboxjs[mapid];
        var settings = {};

        // Build the settings object.
        if (mapObj.configuration.zoomer !== 1) {
          settings['zoomControl'] = false;
        }

        if (mapObj.configuration.scrollWheelZoom !== 1) {
          settings['scrollWheelZoom'] = false;
        }

        if (mapObj.configuration.doubleClickZoom !== 1) {
          settings['doubleClickZoom'] = false;
        }

        if (mapObj.configuration.dragging !== 1) {
          settings['dragging'] = false;
        }

        var map = L.mapbox.map(mapid, null, settings);

        // Note the closure needed here to ensure the right "map" is passed.
        !function (mapObj, map) {
          Drupal.mapboxjs.render_map(mapObj, map);
          // Allow other modules to alter the map.
          $(document).trigger('mapBoxJs.alterMap', [map]);
        }(mapObj, map);
      }
    }
  };

  Drupal.mapboxjs = {

    /**
     * Render a mapboxjs map.
     *
     * @param mapObj
     *   Map configuration object.
     * @param map
     *   MapBoxJS map object
     */
    render_map: function(mapObj, map) {

      var interactive = false;
      if (mapObj.configuration.interactive === 1) {
        interactive = true;
      }

      // Legend
      var legend = false;
      if (mapObj.configuration.legend === 1) {
        map.addControl(L.mapbox.legendControl());
        legend = true;

        // Set triggers to add/remove legend contents as layers are added/removed.
        map.on('layeradd', function(e) {
          if (e.layer.getTileJSON) {
            var tileJSON = e.layer.getTileJSON();
            if (legend) {
              if (tileJSON && tileJSON.legend) {
                map.legendControl.addLegend(tileJSON.legend);
              }
            }
          }
        });

        map.on('layerremove', function(e) {
          if (e.layer.getTileJSON) {
            var tileJSON = e.layer.getTileJSON();
            if (legend) {
              if (tileJSON && tileJSON.legend) {
                map.legendControl.removeLegend(tileJSON.legend);
              }
            }
          }
        });
      }

      map.setView({ lat:mapObj.configuration.center.lat, lon:mapObj.configuration.center.lon }, mapObj.configuration.zoom);

      var layers = {
        'base': [], 
        'optional': []
      };

      for (var type in layers) {
        for (var i in mapObj.layers[type]) {

          var tile_layer = L.mapbox.tileLayer(mapObj.layers[type][i]['url']);

          // If interactive get the gridLayer and add both tile and grid layers
          // to a layerGroup so they are added/removed together.
          if (interactive) {
            var gridLayer = L.mapbox.gridLayer(mapObj.layers[type][i]['url']);
            layer = L.layerGroup([tile_layer, gridLayer]);
            map.addControl(L.mapbox.gridControl(gridLayer));
          }
          else {
            layer = tile_layer;
          }
  
          if (mapObj.layers[type][i]['active'] == true) {
            if (legend) {
              // Async loading, so when ready check if we need to load the legend.
              tile_layer.on('ready', function() {
                // get TileJSON data from the loaded layer
                var tileJSON = this.getTileJSON();
                if (tileJSON && tileJSON.legend) {
                  map.legendControl.addLegend(tileJSON.legend);
                }
              });
            }
            // Layer is active, add it to the map immediately.
            layer.addTo(map);
          }

          layers[type][mapObj.layers[type][i]['label']] = layer;
        }
      }

      // Enable the leaflet layer switcher.
      if (mapObj.configuration.layer_switcher === 1) {
        L.control.layers(layers['base'], layers['optional']).addTo(map);
      }

    }

  };

})(jQuery);
