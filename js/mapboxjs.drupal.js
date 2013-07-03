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

      // Place all layer URLS into a single array for loading.
      var layer_urls = [];
      for (var layer_group in mapObj.layers) {
        for (var i in mapObj.layers[layer_group]) {
          layer_urls.push(mapObj.layers[layer_group][i].url);
        }
      }

      // Load all layers and process in a callback.
      mapbox.load(layer_urls, function(data){
        // Layers are returned in the same order they are passed in. We use
        // this to ensure layers are added to the map in the right order while
        // still respecting layer groupings.
        var layer_index = 0;
        for (var layer_group in mapObj.layers) {
          // Add the fully loaded map layer to the right layer group.
          for (var i in mapObj.layers[layer_group]) {
            mapObj.layers[layer_group][i].layer = data[layer_index].layer;
            layer_index++;
          }

          // Hack to determine if a layer is a "base" layer based on the name.
          var base = (layer_group.indexOf('base') > -1);

          // Add layers to the map and render UI.
          Drupal.mapboxjs.load_layers(mapObj.layers[layer_group], map, base, layer_group);
        }
      });

      if (mapObj.configuration.interactive === 1) {
        map.interaction.auto();
      }
    },

    /**
     * Load and enable map layers. Generally used as a callback for mapbox.load().
     *
     * @param layer_group
     *   Collections of layers and their metadata.
     * @param map
     *   Fully loaded map object.
     * @param base
     *   Book indicating if layers are base or optional.
     * @param switcher_id
     *   Use to give each switcher a unique ID.
     */
    load_layers: function (layer_group, map, base, switcher_id) {
      if (layer_group.length > 1 || !base) {
        var switcher = document.createElement('ul');
        switcher.className = 'mapboxjs-switcher mapboxjs-switcher-' + (base ? 'base' : 'optional');
        switcher.id = 'mapboxjs-switcher-' + switcher_id;
        for (var i = 0; i < layer_group.length; i++) {
          var map_layer = layer_group[i].layer;

          map.addLayer(map_layer);

          var item = document.createElement('li');
          var layer = document.createElement('a');
              layer.href = '#';
              layer.id = map_layer.id();
              layer.className = 'mapboxjs-switcher-link';
              layer.innerHTML = layer_group[i].label;

          if (layer_group[i].active) {
            map_layer.enable();
            $(layer).addClass('mapboxjs-layer-active');
          }
          else {
            map_layer.disable();
          }

          // Note we need both click and touchstart events to ensure mobile
          // compatibility.
          $(layer).bind('click touchstart', function(e) {
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
          });

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
