<?php
/**
 * @file
 * bean_mapboxjs1.features.field.inc
 */

/**
 * Implements hook_field_default_fields().
 */
function bean_mapboxjs_field_default_fields() {
$fields = array();

  // Exported field: 'bean-bean_mapboxjs-field_mapbox_tileset_url'.
  $fields['bean-bean_mapboxjs-field_mapbox_tileset_url'] = array(
    'field_config' => array(
      'active' => '1',
      'cardinality' => '-1',
      'deleted' => '0',
      'entity_types' => array(),
      'field_name' => 'field_mapbox_tileset_url',
      'foreign keys' => array(),
      'indexes' => array(),
      'locked' => '1',
      'module' => 'link',
      'settings' => array(
        'attributes' => array(
          'class' => '',
          'rel' => '',
          'target' => 'default',
        ),
        'display' => array(
          'url_cutoff' => 80,
        ),
        'enable_tokens' => 1,
        'title' => 'optional',
        'title_maxlength' => 128,
        'title_value' => '',
        'url' => 0,
      ),
      'translatable' => '0',
      'type' => 'link_field',
    ),
    'field_instance' => array(
      'bundle' => 'bean_mapboxjs',
      'default_value' => NULL,
      'deleted' => '0',
      'description' => 'Please enter the full URL of a <a href="http://mapbox.com">MapBox</a> tileset to be added to this map. This URL should be in the TileJSON file format, like http://a.tiles.mapbox.com/v3/tmcw.map-hehqnmda.jsonp. The "title" you enter for this URL will be used in the map\'s tile switcher.',
      'display' => array(
        'default' => array(
          'label' => 'hidden',
          'module' => 'link',
          'settings' => array(),
          'type' => 'link_default',
          'weight' => '0',
        ),
      ),
      'entity_type' => 'bean',
      'field_name' => 'field_mapbox_tileset_url',
      'label' => 'Tileset URL',
      'required' => 1,
      'settings' => array(
        'attributes' => array(
          'class' => '',
          'configurable_title' => 0,
          'rel' => '',
          'target' => 'default',
          'title' => '',
        ),
        'display' => array(
          'url_cutoff' => '80',
        ),
        'enable_tokens' => 1,
        'title' => 'required',
        'title_maxlength' => '128',
        'title_value' => '',
        'url' => 0,
        'user_register_form' => FALSE,
        'validate_url' => 1,
      ),
      'widget' => array(
        'active' => 0,
        'module' => 'link',
        'settings' => array(),
        'type' => 'link_field',
        'weight' => '-4',
      ),
    ),
  );

  // Translatables
  // Included for use with string extractors like potx.
  t('Please enter the full URL of a <a href="http://mapbox.com">MapBox</a> tileset to be added to this map. The "title" you enter for this URL will be used in the map\'s tile switcher.');
  t('Tileset URL');

  return $fields;
}
