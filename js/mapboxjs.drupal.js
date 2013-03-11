(function ($) {

  Drupal.behaviors.mapboxjs = {
    attach:function (context, settings) {
      for (var mapid in settings.mapboxjs) {
        var mapObj = settings.mapboxjs[mapid];
        var map = mapbox.map(mapid);

        // Note the closure needed here to ensure the right "map" is passed.
        !function (mapObj, map) {
          Drupal.mapboxjs.render_map(mapObj, map);
          // Allow other modules to alter the map.
          $(document).trigger('mapBoxJs.alterMap', [map]);
        }(mapObj, map);

        settings.mapboxjs[mapid].map = map;
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

      for (var layer_group in mapObj.layers) {
        var layers = mapObj.layers[layer_group];

        var layer_urls = [];
        for (var i in mapObj.layers[layer_group]) {
          layer_urls[i] = mapObj.layers[layer_group][i].url;
        }

        !function(layers, layer_group){
          mapbox.load(layer_urls, function(data) {
            // This is a hack to determine if layers should be
            // inclusive / exclusive. Condition based on if the layer name
            // contains the word 'base'.
            var base = (layer_group.indexOf('base') > -1);
            Drupal.mapboxjs.load_layers(data, layers, map, base, layer_group);
          })
        }(layers, layer_group)
      }

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
     * @param switcher_id
     *   Use to give each switcher a unique ID.
     */
    load_layers: function (data, layers, map, base, switcher_id) {
      if (layers.length > 1 || !base) {
        var switcher = document.createElement('ul');
        switcher.className = 'mapboxjs-switcher mapboxjs-switcher-' + (base ? 'base' : 'optional');
        switcher.id = 'mapboxjs-switcher-' + switcher_id;
        for (var i = 0; i < data.length; i++) {
          var o = data[i];

          map.insertLayerAt(i, o.layer);

          var item = document.createElement('li');
          var layer = document.createElement('a');
              layer.href = '#';
              layer.id = o.layer.id();
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
                if (link.id === this.id) {
                  map.getLayer(this.id).enable();
                  $(this).addClass('mapboxjs-layer-active');
                }
                else{
                  map.getLayer(this.id).disable();
                  $(this).removeClass('mapboxjs-layer-active');
                }
              });
            }
            else {
              map.getLayer(this.id).enabled ? map.getLayer(this.id).disable() : map.getLayer(this.id).enable();
              $(this).toggleClass('mapboxjs-layer-active');
            }

            map.refresh();
          };

          // Ensure double click events don't conflict with map zooming.
          layer.ondblclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
          }

          item.appendChild(layer);
          switcher.appendChild(item);
        }
        document.getElementById(map.parent.id).appendChild(switcher);
      }
      else {
        map.addLayer(data[0].layer);
      }
    }
  };

})(jQuery);

