<?php

define('MAPBOXJS_PRESET_NAME_LENGTH', 128);

/**
 * Return a form for a mapbox.js map preset entity.
 *
 * @param $form
 * @param $form_state
 * @param null $preset
 *
 * @return mixed
 */
function mapboxjs_preset_form($form, &$form_state, MapboxjsPreset $preset = NULL, $op = 'edit') {
    if ($op == 'clone') {
    $preset->label .= ' (cloned)';
    $preset->name = '';
  }
  $form['#id'] = 'maboxjs_preset_form';
  $form_state['maboxjs_preset'] = $preset;

  $form['label'] = array(
    '#title' => t('Label'),
    '#type' => 'textfield',
    '#default_value' => isset($preset) ? $preset->label : '',
    '#description' => t('The human-readable name of this MapBox.js map preset.'),
    '#required' => TRUE,
    '#maxlength' => MAPBOXJS_PRESET_NAME_LENGTH,
    '#size' => 30,
  );
  $form['name'] = array(
    '#title' => t('Name'),
    '#type' => 'machine_name',
    '#description' => t(''),
    '#default_value' => isset($preset) ? $preset->name : '',
    '#disabled' => !empty($preset->name),
    '#machine_name' => array(
      'exists' => 'mapboxjs_get_presets',
      'source' => array('label')
    ),
  );
  // Provide preset administrator with control over the map container height.
  $form['height'] = array(
    '#type' => 'textfield',
    '#title' => t('Mabox map height'),
    '#description' => t('Enter the height in pixels for this map.'),
    '#default_value' => isset($preset->height) ? $preset->height : '500',
    '#size' => '5',
    '#field_suffix' => t('px'),
    '#element_validate' => array('element_validate_integer_positive'),
  );
  // Enable/disable zoom controls.
  $form['zoomer'] = array(
    '#type' => 'checkbox',
    '#title' => t('Provide zoom controls'),
    '#default_value' => isset($preset->zoomer) ? $preset->zoomer : TRUE,
  );
  // Enable/disable fullscreen control.
  $form['fullscreen'] = array(
    '#type' => 'checkbox',
    '#title' => t('Provide fullscreen map option'),
    '#default_value' => isset($preset->fullscreen) ? $preset->fullscreen : FALSE,
  );
  // Enable/disable layer toggle control.
  $form['layer_toggle'] = array(
    '#type' => 'checkbox',
    '#title' => t('Provide layer toggle controls'),
    '#description' => t('Select this option to present a layer switcher to toggle on/off the tileset layers provided above.'),
    '#default_value' => isset($preset->layer_toggle) ? $preset->layer_toggle : FALSE,
  );
  // Add an optional base tileset layer.
  $form['base_layer'] = array(
    '#type' => 'textfield',
    '#title' => t('Base tileset'),
    '#description' => t('Optionally, you can enter the URL of a base tileset, such as a terrain layer. This layer must support the <a href="https://github.com/mapbox/tilejson-spec">TileJSON</a> format.'),
    '#default_value' => isset($preset->base_layer) ? $preset->base_layer : '',
    '#element_validate' => array('mapboxjs_base_layer_validate'),
  );

  // Attach our locked link field.
  field_attach_form('mapboxjs_preset', $preset, $form, $form_state);

  $form['actions'] = array('#type' => 'actions');
  $form['actions']['submit'] = array(
    '#value' => t('Save preset'),
    '#type' => 'submit',
  );

  return $form;
}

/**
 * Helper function to validate base tileset URL.
 * @TODO - Consider adding this validation to mapboxjs_preset_form_validate().
 */
function mapboxjs_base_layer_validate($element, &$form_state, $form) {
  if (!empty($element['#value']) && !(valid_url($element['#value'], TRUE))) {
    form_error($element, t('Enter a valid URL or leave this field blank.'));
  }
}

/**
 * Validation handler for mapboxjs_preset_form().
 */
function mapboxjs_preset_form_validate($form, &$form_state) {
  // Call to field_attach_form_validate() ensures that locked link field is validated.
  $preset = $form_state['mapboxjs_preset'];
  field_attach_form_validate('mapboxjs_preset', $preset, $form, $form_state);
  // @FIXME - For some reason, link field URL is not getting validated.
}

/**
 * Submit handler for mapboxjs_preset_form().
 *
 * @param $form
 * @param $form_state
 */
function mapboxjs_preset_form_submit($form, &$form_state) {

  $values = $form_state['values'];

  if ($form_state['mapboxjs_preset']->name) {
    $preset = $form_state['mapboxjs_preset'];
    foreach ($values as $key => $value) {
      $preset->{$key} = $value;
    }
  }
  else {
    $preset = entity_create('mapboxjs_preset', $values);
  }

  // Make sure that attached link field is saved with our custom entity.
  field_attach_submit('mapboxjs_preset', $preset, $form, $form_state);

  $preset->save();

  drupal_set_message(t('MapBox.js map preset saved.'));
  $form_state['redirect'] = 'admin/structure/mapboxjs/presets';
}
