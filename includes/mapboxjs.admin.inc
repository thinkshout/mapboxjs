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
    '#weight' => -10,
  );
  $form['name'] = array(
    '#title' => t('Name'),
    '#type' => 'machine_name',
    '#description' => t(''),
    '#default_value' => isset($preset) ? $preset->name : '',
    '#disabled' => !empty($preset->name),
    '#machine_name' => array(
      'exists' => 'mapboxjs_load_presets',
      'source' => array('label')
    ),
    '#weight' => -10,
  );

  $form['settings'] = array(
    '#title' => t('Settings'),
    '#type' => 'container',
    '#description' => t(''),
    '#tree' => TRUE
  );

  // Provide preset administrator with control over the map container height.
  $form['settings']['height'] = array(
    '#type' => 'textfield',
    '#title' => t('Mabox map height'),
    '#description' => t('Enter the height in pixels for this map.'),
    '#default_value' => isset($preset) ? $preset->settings['height'] : '500',
    '#size' => '5',
    '#field_suffix' => t('px'),
    '#element_validate' => array('element_validate_integer_positive'),
  );
  // Set the lat/lon center points.
  $form['settings']['center'] = array(
    '#type' => 'fieldset',
    '#title' => t('Center point'),
    '#description' => t('Enter the lat/long center point of this map in decimal degrees.'),
    '#collapsible' => TRUE,
  );
  $form['settings']['center']['lat'] = array(
    '#type' => 'textfield',
    '#title' => t('Latitude'),
    '#default_value' => isset($preset) ? $preset->settings['center']['lat'] : 0,
  );
  $form['settings']['center']['lon'] = array(
    '#type' => 'textfield',
    '#title' => t('Longitude'),
    '#default_value' => isset($preset) ? $preset->settings['center']['lon'] : 0,
  );
  // Set default zoom level.
  $form['settings']['zoom'] = array(
    '#type' => 'select',
    '#title' => t('Zoom level'),
    '#description' => t('Select the default zoom level for this map.'),
    '#options' => drupal_map_assoc(array(0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20)),
    '#default_value' => isset($preset) ? $preset->settings['zoom'] : 8,
  );
  // Enable/disable zoom controls.
  $form['settings']['zoomer'] = array(
    '#type' => 'checkbox',
    '#title' => t('Provide zoom controls'),
    '#default_value' => isset($preset) ? $preset->settings['zoomer'] : TRUE,
  );
  // Enable/disable fullscreen control.
  $form['settings']['fullscreen'] = array(
    '#type' => 'checkbox',
    '#title' => t('Provide fullscreen map option'),
    '#default_value' => isset($preset) ? $preset->settings['fullscreen'] : FALSE,
  );
  // Enable/disable map legend.
  $form['settings']['legend'] = array(
    '#type' => 'checkbox',
    '#title' => t('Provide a map legend, if included with MapBox tileset(s).'),
    '#default_value' => isset($preset) ? $preset->settings['legend'] : FALSE,
  );
  // Enable interactive data
  $form['settings']['interactive'] = array(
    '#type' => 'checkbox',
    '#title' => t('Enable default interactive settings - animated tooltips - for interaction with the map.'),
    '#default_value' => isset($preset) ? $preset->settings['interactive'] : FALSE,
  );

  $form['base_layers_wrapper'] = array(
    '#title' => t('Base layers'),
    '#type' => 'fieldset',
    '#collapsible' => TRUE,
    '#description' => t('Please enter the full URL of a MapBox tileset to be added to this map. This URL should be in the TileJSON file format, like http://a.tiles.mapbox.com/v3/tmcw.map-hehqnmda.jsonp. The label is used in the map\'s layer switcher.'),
    '#attributes' => array('id' => 'mapboxjs-base-layer-wrapper')
  );

  $form['base_layers_wrapper']['base_layers'] = array(
    '#theme' => 'mapboxjs_preset_form_table',
    '#tree' => TRUE
  );

  $layers = array(array('weight' => 0, 'url' => '', 'label' => '', 'active' => 0));
  if (!empty($form_state['values']['base_layers'])) {
    $layers = $form_state['values']['base_layers'];
  }
  else if (!empty($preset->layers['base'])) {
    $layers = $preset->layers['base'];
  }

  if ((isset($form_state['triggering_element']) && $form_state['triggering_element']['#name'] == 'mapboxjs_add_base_layer')) {
    $layers[] = array('weight' => 0, 'url' => '', 'label' => '', 'active' => 0);
  }

  foreach ($layers as $delta => $layer) {
    $form['base_layers_wrapper']['base_layers'][$delta] = array(
      'label' => array(
        '#type' => 'textfield',
        '#default_value' => $layer['label'],
      ),
      'url' => array(
        '#type' => 'textfield',
        '#default_value' => $layer['url'],
      ),
      'active' => array(
        '#type' => 'radio',
        '#return_value' => $delta,
        '#default_value' => ($layer['active']) ? $delta : FALSE,
        '#name' => 'active',
        '#tree' => FALSE
      ),
      'weight' => array(
        '#type' => 'weight',
        '#delta' => 30,
        '#default_value' => $layer['weight'],
      )
    );
  }
  $form['mapboxjs_add_base_layer'] = array(
    '#value' => t('Add base layer'),
    '#type' => 'button',
    '#ajax' => array(
      'callback' => 'mapboxjs_preset_form_callback',
      'wrapper' => 'mapboxjs-base-layer-wrapper'
    ),
    '#name' => 'mapboxjs_add_base_layer',
  );

  $form['layers_wrapper'] = array(
    '#title' => t('Map layers'),
    '#type' => 'fieldset',
    '#collapsible' => TRUE,
    '#description' => t('Please enter the full URL of a MapBox tileset to be added to this map. This URL should be in the TileJSON file format, like http://a.tiles.mapbox.com/v3/tmcw.map-hehqnmda.jsonp. The label is used in the map\'s layer switcher.'),
    '#attributes' => array('id' => 'mapboxjs-layer-wrapper')
  );
  
  $form['layers_wrapper']['layers'] = array(
    '#theme' => 'mapboxjs_preset_form_table',
    '#tree' => TRUE
  );

  $layers = array(array('weight' => 0, 'url' => '', 'label' => '', 'base' => 0, 'active' => 0));
  if (!empty($form_state['values']['layers'])) {
    $layers = $form_state['values']['layers'];
  }
  else if (!empty($preset->layers)) {
    $layers = $preset->layers['optional'];
  }

  if ((isset($form_state['triggering_element']) && $form_state['triggering_element']['#name'] == 'mapboxjs_add_layer')) {
    $layers[] = array('weight' => 0, 'url' => '', 'label' => '', 'base' => 0, 'active' => 0);
  }

  foreach ($layers as $delta => $layer) {
    $form['layers_wrapper']['layers'][$delta] = array(
      'label' => array(
        '#type' => 'textfield',
        '#default_value' => $layer['label'],
      ),
      'url' => array(
        '#type' => 'textfield',
        '#default_value' => $layer['url'],
      ),
      'active' => array(
        '#type' => 'checkbox',
        '#default_value' => $layer['active'],
      ),
      'weight' => array(
        '#type' => 'weight',
        '#delta' => 30,
        '#default_value' => $layer['weight'],
      )
    );
  }
  $form['mapboxjs_add_layer'] = array(
    '#value' => t('Add layer'),
    '#type' => 'button',
    '#ajax' => array(
      'callback' => 'mapboxjs_preset_form_callback',
      'wrapper' => 'mapboxjs-layer-wrapper'
    ),
    '#name' => 'mapboxjs_add_layer',
  );

  $form['actions'] = array('#type' => 'actions');
  $form['actions']['submit'] = array(
    '#value' => t('Save preset'),
    '#type' => 'submit',
  );

  return $form;
}

/**
 * AJAX callback for managing layers.
 */
function mapboxjs_preset_form_callback($form, $form_state) {
  if ($form_state['triggering_element']['#name'] == 'mapboxjs_add_layer') {
    return $form['layers_wrapper'];
  }
  else if($form_state['triggering_element']['#name'] == 'mapboxjs_add_base_layer') {
    return $form['base_layers_wrapper'];
  }
}

/**
 * Validation handler for mapboxjs_preset_form().
 */
function mapboxjs_preset_form_validate($form, &$form_state) {
  // Validate lat/lon values.
  $lat = $form_state['values']['settings']['center']['lat'];
  $lon = $form_state['values']['settings']['center']['lon'];
  if (!empty($lat) & (!is_numeric($lat) || $lat > 90 || $lat < -90)) {
    form_set_error('lat', t('Enter the latitude of the center point as a decimal between -90 and 90.'));
  }
  if (!empty($lon) & (!is_numeric($lon) || $lon > 180 || $lon < -180)) {
    form_set_error('lon', t('Enter the longitude of the center point as a decimal between -180 and 180.'));
  }

  // validate layer URLs
  foreach ($form_state['values']['layers'] as $key => $layer) {
    if (empty($layer['url'])) {
      unset($form_state['values']['layers'][$key]);
    }
    if (!empty($layer['url']) && !valid_url($layer['url'], TRUE)) {
      form_set_error("layers][{$key}][url", t('Map layer URL is invalid.'));
    }
  }
  foreach ($form_state['values']['base_layers'] as $key => $layer) {
    if (empty($layer['url'])) {
      unset($form_state['values']['base_layers'][$key]);
    }
    if (!empty($layer['url']) && !valid_url($layer['url'], TRUE)) {
      form_set_error("base_layers][{$key}][url", t('Map layer URL is invalid.'));
    }
  }
}

/**
 * Submit handler for mapboxjs_preset_form().
 *
 * @param $form
 * @param $form_state
 */
function mapboxjs_preset_form_submit($form, &$form_state) {
  $values = $form_state['values'];
  $preset = $form_state['mapboxjs_preset'];
  if (empty($preset->name)) {
    $preset = entity_create('mapboxjs_preset', $values);
  }

  $preset->label = $values['label'];
  $preset->name = $values['name'];
  foreach ($values['settings'] as $key => $value) {
    $preset->settings[$key] = $value;
  }
  $layers = $values['layers'];
  $base_layers = $values['base_layers'];

  // ensure our layers are sorted by weight
  usort($layers, function($a, $b) {
    return $a['weight'] > $b['weight'];
  });
  usort($base_layers, function($a, $b) {
    return $a['weight'] > $b['weight'];
  });

  foreach ($base_layers as $key => $base_layer) {
    $base_layers[$key]['active'] = ($key === (int) $values['active']);
  }

  $preset->layers = array(
    'base' => $base_layers,
    'optional' => $layers
  );

  $preset->save();

  $form_state['redirect'] = array('admin/structure/mapboxjs/presets/manage');
  drupal_set_message(t('MapBox.js map preset saved.'));
}

/**
 * Returns the rendered tabledrag form for the map layer listing.
 *
 * @ingroup themeable
 */
function theme_mapboxjs_preset_form_table($variables) {
  drupal_add_tabledrag('mapboxjs-preset-layers-table', 'order', 'sibling', 'layer-weight');
  $elements = $variables['elements'];

  $header = array(
    t('Label'),
    t('Tile URL'),
    t('Active'),
    t('Weight')
  );

  // Build the rows array.
  $rows = array();
  foreach (element_children($elements) as $child_key) {
    $child = & $elements[$child_key];
    $child['weight']['#attributes']['class'] = array('layer-weight');
    $rows[] = array(
      'data' => array(
        drupal_render($child['label']),
        drupal_render($child['url']),
        drupal_render($child['active']),
        drupal_render($child['weight']),
      ),
      'class' => array('draggable'),
    );
  }

  return theme('table', array(
    'header' => $header,
    'rows' => $rows,
    'attributes' => array('id' => 'mapboxjs-preset-layers-table'),
  ));
}
