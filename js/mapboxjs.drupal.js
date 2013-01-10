(function ($) {

  Drupal.behaviors.mapboxjs = {
    attach:function (context, settings) {

      $(settings.mapboxjs).each(function () {
        var mapObj = this;

        // Load a map with the right ID and optionally add some controls and variables.
        var map = mapbox.map(mapObj.mapID);
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
      });
    }
  };

  Drupal.mapboxjs = {

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
            switcher.id = 'mapboxjs-switcher-' + (base ? 'base' : 'optional');
            switcher.className = 'mapboxjs-switcher';
        for (var i = 0; i < data.length; i++) {
          var o = data[i];
          map.addLayer(o.layer);
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
              $('#mapboxjs-switcher-base a', $('#' + map.parent.id)).each(function(){
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
              map.interaction.refresh();
            }
          };

          item.appendChild(layer);
          switcher.appendChild(item);
        }
        document.getElementById(map.parent.id).appendChild(switcher);
      }
      else {
        map.addLayer(data[0].layer);
      }
      map.interaction.auto();
    }

  };

})(jQuery);

