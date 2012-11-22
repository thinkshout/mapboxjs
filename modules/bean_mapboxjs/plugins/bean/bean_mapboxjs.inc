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
    );
  }

  /**
   * Builds extra settings for the block edit form.
   */
  public function form($bean, $form, &$form_state) {
    $form = array();

    $form['settings'] = array(
      '#type' => 'fieldset',
      '#title' => t('Options'),
    );

    $form['settings']['height'] = array(
      '#type' => 'textfield',
      '#title' => t('Mabox map height'),
      '#description' => t('Enter the height in pixels for this map.'),
      '#default_value' => isset($bean->height) ? $bean->height : '500',
      '#element_validate' => array('element_validate_integer_positive'),
    );
    return $form;
  }

  /**
   * Displays the MapBox bean.
   */
  public function view($bean, $content, $view_mode = 'default', $langcode = NULL) {
    drupal_add_js(drupal_get_path('module', 'bean_mapboxjs') . '/js/bean_mapboxjs.drupal.js');
    $map_id = 'bean-' . $bean->delta;
    $tileset_items = field_get_items('bean', $bean, 'field_mapbox_tileset_url');
    $tilesets = array();
    foreach($tileset_items as $item) {
      $tilesets[]['url'] = $item['url'];
    }
    $settings = array(
    'mapID' => $map_id,
    'configuration' => array(
      'tileset1' => $tilesets['0']['url'],
    ));
    drupal_add_js(array('bean_mapboxjs' => $settings), 'setting');
    $content['bean'][$bean->bid]['bean_mapboxjs']['#markup'] = mapboxjs_render_map($map_id, $bean->height . 'px');
    return $content;
  }
}
