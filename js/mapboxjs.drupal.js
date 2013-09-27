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

        // @TODO more leaflet settings.

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

      // Legend
      var legend = false;
      if (mapObj.configuration.legend === 1) {
        map.addControl(L.mapbox.legendControl());
        legend = true;
      }

      // Set triggers to add/remove legend contents and gridlayers based on active layer.
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

      map.setView({ lat:mapObj.configuration.center.lat, lon:mapObj.configuration.center.lon }, mapObj.configuration.zoom);

      var base_layers = {};
      for (var i in mapObj.layers['base']) {

        var layer = L.mapbox.tileLayer(mapObj.layers['base'][i]['url']);
        var gridLayer = L.mapbox.gridLayer(mapObj.layers['base'][i]['url']);

        if (mapObj.layers['base'][i]['active'] === true) {
          // Async loading, so when ready check if we need to load the legend.
          // Somehow doesn't trigger layeradd event.
          layer.on('ready', function() {
            // get TileJSON data from the loaded layer
            var tileJSON = this.getTileJSON();
            if (tileJSON && tileJSON.legend) {
              map.legendControl.addLegend(tileJSON.legend);
            }
          });
          map.addLayer(layer);

          map.addLayer(gridLayer);
          map.addControl(L.mapbox.gridControl(gridLayer));
        }
        base_layers[mapObj.layers['base'][i]['label']] = layer;
      }

      var optional_layers = {};
      for (var i in mapObj.layers['optional']) {
        var layer = L.mapbox.tileLayer(mapObj.layers['optional'][i]['url']);

        if (mapObj.layers['optional'][i]['active'] === 1) {
          // Async loading, so when ready check if we need to load the legend.
          // Somehow doesn't trigger layeradd event.
          layer.on('ready', function() {
            // get TileJSON data from the loaded layer
            var tileJSON = this.getTileJSON();
            if (tileJSON && tileJSON.legend) {
              map.legendControl.addLegend(tileJSON.legend);
            }
          });
          map.addLayer(layer);

          var gridLayer = L.mapbox.gridLayer(mapObj.layers['optional'][i]['url']);

          map.addLayer(gridLayer);
          map.addControl(L.mapbox.gridControl(gridLayer));
        }
        optional_layers[mapObj.layers['optional'][i]['label']] = layer;
      }

      L.control.layers(base_layers, optional_layers).addTo(map);

    }

  };

})(jQuery);
