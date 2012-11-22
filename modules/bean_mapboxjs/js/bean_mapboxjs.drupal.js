(function ($) {

  Drupal.behaviors.bean_mapboxjs = {
    attach: function (context, settings) {

      $(settings.bean_mapboxjs).each(function () {

        // Load a settings object with all of our map settings.
        var settings = {};
        for (var setting in this.configuration) {
          settings[setting] = this.configuration[setting];
        }

        // Load a simple map example.
        mapbox.auto(this.mapID, settings.tilesets['0']['url']);

      });

    }
  }

})(jQuery);
