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
      'exists' => 'mapboxjs_preset_load',
      'source' => array('label')
    ),
  );

  $form['actions'] = array('#type' => 'actions');
  $form['actions']['submit'] = array(
    '#value' => t('Save preset'),
    '#type' => 'submit',
  );

  return $form;
}

/**
 * Validate mapboxjs_preset_form().
 *
 * @param $form
 * @param $form_state
 */
function mapboxjs_preset_form_validate($form, &$form_state) {

}

/**
 * Submit handler for mapboxjs_preset_form().
 *
 * @param $form
 * @param $form_state
 */
function mapboxjs_preset_form_submit($form, &$form_state) {
  $values = $form_state['values'];

  $params = array(
    'label' => $values['label'],
  );

  if ($form_state['mapboxjs_preset']->name) {
    $preset = $form_state['mapboxjs_preset'];
    foreach ($params as $key => $value) {
      $preset->{$key} = $value;
    }
  }
  else {
    $params['name'] = $values['name'];
    $preset = entity_create('mapboxjs_preset', $params);
  }

  $preset->save();

  drupal_set_message(t('MapBox.js map preset saved.'));
  $form_state['redirect'] = 'admin/structure/mapboxjs/presets';
}
