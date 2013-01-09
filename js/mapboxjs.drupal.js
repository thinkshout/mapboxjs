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

        var layers_to_load = [];
        for (var i in mapObj.layers) {
          layers_to_load[i] = mapObj.layers[i].url;
        }

        mapbox.load(layers_to_load, function(data) {
          if (mapObj.layers.length > 1) {
            var switcher = document.createElement('ul');
                switcher.id = 'mapboxjs-switcher';
            for (var i = 0; i < data.length; i++) {
              var o = data[i];
              map.addLayer(o.layer);
              var item = document.createElement('li');
              var layer = document.createElement('a');
                  layer.href = '#';
                  layer.id = o.layer.id();
                  layer.innerHTML = mapObj.layers[i].label;

              if (mapObj.layers[i].active) {
                o.layer.enable();
                layer.className = 'mapboxjs-layer-active';
              }
              else {
                o.layer.disable();
              }

              layer.onclick = function(e) {
                e.preventDefault();
                e.stopPropagation();
                map.getLayer(this.id).enabled ? map.getLayer(this.id).disable() : map.getLayer(this.id).enable();
                $(this).toggleClass('mapboxjs-layer-active');
              }

              item.appendChild(layer);
              switcher.appendChild(item);
            }
            document.getElementById(mapObj.mapID).appendChild(switcher);
          }
          else {
            map.addLayer(data[0].layer);
          }
        });

      });
    }
  };

})(jQuery);
