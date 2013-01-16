(function ($) {

  Drupal.behaviors.mapboxjs = {
    attach:function (context, settings) {

      for (var mapid in settings.mapboxjs) {
        var mapObj = settings.mapboxjs[mapid];
        var map = mapbox.map(mapid);

        // Note the closure needed here to ensure the right "map" is passed.
        !function (mapObj, map) {
          Drupal.mapboxjs.render_map(mapObj, map);
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
      if (mapObj.configuration.zoomer === 1) {
        map.ui.zoomer.add();
      }
      if (mapObj.configuration.fullscreen === 1) {
        map.ui.fullscreen.add();
      }
      if (mapObj.configuration.legend === 1) {
        map.ui.legend.add();
      }
      map.centerzoom({ lat:mapObj.configuration.center.lat, lon:mapObj.configuration.center.lon }, mapObj.configuration.zoom);

      var base_layers = [];
      for (var i in mapObj.layers.base) {
        base_layers[i] = mapObj.layers.base[i].url;
      }

      mapbox.load(base_layers, function(data) {
        Drupal.mapboxjs.load_layers(data, mapObj.layers.base, map, true);

        // Add optional layers. Need to ensure this is done after base layers load.
        var optional_layers = [];
        for (var i in mapObj.layers.optional) {
          optional_layers[i] = mapObj.layers.optional[i].url;
        }

        mapbox.load(optional_layers, function(data) {
          Drupal.mapboxjs.load_layers(data, mapObj.layers.optional, map, false);
        });

      });

      if (mapObj.configuration.interactive === 1) {
        map.interaction.auto();
      }
    },

    /**
     * Load and enable map layers. Generally used as a callback for mapbox.load().
     *
     * @param data
     *   Collection of laoded mapbox layers.
     * @param layers
     *   Layers stored in a preset.
     * @param map
     *   Fully loaded map object.
     * @param base
     *   Book indicating if layers are base or optional.
     */
    load_layers: function (data, layers, map, base) {
      if (layers.length > 1 || !base) {
        var switcher = document.createElement('ul');
            switcher.className = 'mapboxjs-switcher mapboxjs-switcher-' + (base ? 'base' : 'optional');
        for (var i = 0; i < data.length; i++) {
          var o = data[i];
          map.addLayer(o.layer);
          var item = document.createElement('li');
          var layer = document.createElement('a');
              layer.href = '#';
              layer.layer_id = o.layer.id();
              layer.className = 'mapboxjs-switcher-link';
              layer.innerHTML = layers[i].label;

          if (layers[i].active) {
            o.layer.enable();
            $(layer).addClass('mapboxjs-layer-active');
          }
          else {
            o.layer.disable();
          }

          layer.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            var link = this;
            if (base) {
              $('a', $(switcher)).each(function(){
                if (link.layer_id === this.layer_id) {
                  map.getLayer(this.layer_id).enable();
                  $(this).addClass('mapboxjs-layer-active');
                }
                else{
                  map.getLayer(this.layer_id).disable();
                  $(this).removeClass('mapboxjs-layer-active');
                }
              });
            }
            else {
              map.getLayer(this.layer_id).enabled ? map.getLayer(this.layer_id).disable() : map.getLayer(this.layer_id).enable();
              $(this).toggleClass('mapboxjs-layer-active');
            }

            map.refresh();
          };

          item.appendChild(layer);
          switcher.appendChild(item);
        }
        document.getElementById(map.parent.id).appendChild(switcher);
      }
      else {
        map.addLayer(data[0].layer);
      }

      map.refresh();
    }
  };

})(jQuery);

