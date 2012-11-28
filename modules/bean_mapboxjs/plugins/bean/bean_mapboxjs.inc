<?php
/**
 * @file
 * Bean: MapBoxjs plugin.
 */

class BeansMapboxjs extends BeanPlugin {
  /**
   * Declares default block settings.
   */
  public function values() {
    return array(
      'height' => '500',
      'zoomer' => TRUE,
      'fullscreen' => FALSE,
      'layer_toggle' => FALSE,
    );
  }

  /**
   * Builds extra settings for the block edit form.
   */
  public function form($bean, $form, &$form_state) {
    $form = array();

    $form['settings'] = array(
      '#type' => 'fieldset',
      '#title' => t('Mapbox Map Options'),
      '#collapsible' => TRUE,
      '#collapsed' => TRUE,
    );

    // Provide bean administrator with control over the map container height.
    $form['settings']['height'] = array(
      '#type' => 'textfield',
      '#title' => t('Mabox map height'),
      '#description' => t('Enter the height in pixels for this map.'),
      '#default_value' => isset($bean->height) ? $bean->height : '500',
      '#element_validate' => array('element_validate_integer_positive'),
    );
    // Enable/disable zoom controls.
    $form['settings']['zoomer'] = array(
      '#type' => 'checkbox',
      '#title' => t('Provide zoom controls'),
      '#default_value' => isset($bean->zoomer) ? $bean->zoomer : TRUE,
    );
    // Enable/disable fullscreen control.
    $form['settings']['fullscreen'] = array(
      '#type' => 'checkbox',
      '#title' => t('Provide fullscreen map option'),
      '#default_value' => isset($bean->fullscreen) ? $bean->fullscreen : FALSE,
    );

    // Enable/disable layer toggle control.
    $form['settings']['layer_toggle'] = array(
      '#type' => 'checkbox',
      '#title' => t('Provide layer toggle controls'),
      '#default_value' => isset($bean->layer_toggle) ? $bean->layer_toggle : FALSE,
      // @TODO - Turn on this feature....But first, fix javascript for managing this feature in bean_mapboxjs.drupal.js.
      '#access' => FALSE,
    );
    return $form;
  }

  /**
   * Displays the MapBox bean.
   */
  public function view($bean, $content, $view_mode = 'default', $langcode = NULL) {

    // @TODO - Abstract more of the javascript into the parent mapboxjs module.
    drupal_add_js(drupal_get_path('module', 'bean_mapboxjs') . '/js/bean_mapboxjs.drupal.js');

    $map_id = 'bean-' . $bean->delta;
    // Grab our tileset URLs.
    $tileset_items = field_get_items('bean', $bean, 'field_tileset_urls');
    $tilesets = array();
    foreach($tileset_items as $item) {
      $tilesets[] = array('title' => $item['title'], 'url' => $item['url']);
    }
    $settings = array(
    'mapID' => $map_id,
    'configuration' => array(
      'zoomer' => $bean->zoomer,
      'fullscreen' => $bean->fullscreen,
      'layer_toggle' => $bean->layer_toggle,
      'tilesets' => $tilesets,
    ));
    // Pass our settings to Drupal's global js variable.
    drupal_add_js(array('bean_mapboxjs' => $settings), 'setting');

    // Generate our map container and place on the page.
    $content['bean'][$bean->bid]['bean_mapboxjs']['#markup'] = mapboxjs_render_map($map_id, $bean->height . 'px');

    // Add additional markup and CSS if layer toggle option selected.
    if ($bean->layer_toggle == TRUE) {
      drupal_add_css(drupal_get_path('module', 'bean_mapboxjs') . '/css/layer_toggle.css');
      $content['bean'][$bean->bid]['bean_mapboxjs']['#markup'] .= "<ul id='map-ui'></ul>";
    }

    return $content;
  }
}
