(function ($) {

  Drupal.behaviors.bean_mapboxjs = {
    attach: function (context, settings) {

      $(settings.bean_mapboxjs).each(function () {

        // Load a settings object with all of our map settings.
        var settings = {};
        for (var setting in this.configuration) {
          settings[setting] = this.configuration[setting];
        }

        // Load a map with the right ID and add some controls.
        var map = mapbox.map(this.mapID);
        map.ui.zoomer.add();
        map.ui.fullscreen.add();

        // Now start adding our layers.
        for (var i = 0; i < settings.tilesets.length; i++) {
          mapbox.load(settings.tilesets[i]['url'], function(data) {
            map.addLayer(data.layer);
            // @TODO - Don't center and zoom twice.
            map.center({ lat: data.center.lat, lon: data.center.lon });
            map.zoom(data.zoom, true);
          });
        }
      })
    }
  }

})(jQuery);
