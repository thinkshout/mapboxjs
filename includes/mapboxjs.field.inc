<?php

/**
 * @file
 * Field hooks.
 */

/**
 * Implements hook_field_info().
 */
function mapboxjs_field_info() {
  return array(
    'mapboxjs_preset' => array(
      'label' => t('MapBox.js map preset'),
      'description' => t('Enables placement of a MapBox.js map as a field on an entity.'),
      'settings' => array(),
      'instance_settings' => array(),
      'default_widget' => 'mapboxjs_preset_select',
      'default_formatter' => 'mapboxjs_preset_default',
      'no_ui' => FALSE
    ),
  );
}

/**
 * Implements hook_field_instance_settings_form().
 */
function mapboxjs_field_instance_settings_form($field, $instance) {

}

/**
 * Implements hook_field_is_empty().
 */
function mapboxjs_field_is_empty($item, $field) {

}


/**
 * Implements hook_field_widget_info().
 */
function mapboxjs_field_widget_info() {
  return array(
    'mapboxjs_select' => array(
      'label' => t('MapBox.js map preset'),
      'field types' => array('mapboxjs_preset'),
      'settings' => array(),
      'behaviors' => array(
        'multiple values' => FIELD_BEHAVIOR_DEFAULT,
        'default value' => FIELD_BEHAVIOR_DEFAULT,
      ),
    ),
  );
}

/**
 * Implements hook_field_widget_form().
 */
function mapboxjs_field_widget_form(&$form, &$form_state, $field, $instance, $langcode, $items, $delta, $element) {
  // @TODO - Test for field settings that do not provide default value.
  switch ($instance['widget']['type']) {
    case 'mapboxjs_select':
      $options = array('' => t('-- No map selected --'));
      foreach (mapboxjs_get_presets() as $preset) {
        $options[$preset->name] = $preset->label;
      }
      $element['value'] = array(
        '#title' => $instance['label'],
        '#description' => $instance['description'],
        '#type' => 'select',
        '#options' => $options,
        '#default_value' => isset($items[$delta]['value']) ? $items[$delta]['value'] : NULL,
      );
    break;
  };
  return $element;
}

/**
 * Implements hook_field_formatter_info().
 */
function mapboxjs_field_formatter_info() {
  return array(
    'mapboxjs_preset_default' => array(
      'label' => t('Default'),
      'field types' => array('mapboxjs_preset'),
    ),
  );
}

/**
 * Implements hook_field_formatter_view().
 */
function mapboxjs_field_formatter_view($entity_type, $entity, $field, $instance, $langcode, $items, $display) {

  $element = array();
  // Iterate through field values and load mapboxjs map presets.
  foreach ($items as $delta => $item) {
    $preset = mapboxjs_get_presets($item['value']);
    if ($preset != FALSE) {
      drupal_add_js(drupal_get_path('module', 'mapboxjs') . '/js/mapboxjs.drupal.js');
      $map_id = 'map-' . $preset->name . '-' . $delta;
      // Grab our tileset URLs.
      $tileset_items = field_get_items('mapboxjs_preset', $preset, 'field_tileset_urls');
      $tilesets = array();
      foreach($tileset_items as $item) {
        $tilesets[] = array('title' => $item['title'], 'url' => $item['url']);
      }
      $settings = array(
      'mapID' => $map_id,
      'configuration' => array(
        'zoomer' => $preset->zoomer,
        'fullscreen' => $preset->fullscreen,
        'layer_toggle' => $preset->layer_toggle,
        'base_layer' => $preset->base_layer,
        'tilesets' => $tilesets,
      ));
      // Pass our settings to Drupal's global js variable.
      drupal_add_js(array('mapboxjs' => $settings), 'setting');

      // Generate our map container and place on the page.
      $element[$delta]['#markup'] = mapboxjs_render_map($map_id, $preset->height . 'px');

      // Add additional markup and CSS if layer toggle option selected.
      if ($preset->layer_toggle == TRUE) {
        drupal_add_css(drupal_get_path('module', 'mapboxjs') . '/css/layer_toggle.css');
        $element[$delta]['#markup'] .= "<ul id='map-ui'></ul>";
      }
    }
  }

  return $element;
}
