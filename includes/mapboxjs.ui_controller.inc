<?php

/**
 * Salesforce Mapping UI controller.
 */
class MapboxjsPresetUIController extends EntityDefaultUIController {

  /**
   * Overrides hook_menu() defaults.
   */
  public function hook_menu() {
    $items = parent::hook_menu();
    $wildcard = isset($this->entityInfo['admin ui']['menu wildcard']) ? $this->entityInfo['admin ui']['menu wildcard'] : '%entity_object';
    $id_count = count(explode('/', $this->path));
    $items[$this->path]['description'] = 'Manage MapBox.js map presets.';
    $items[$this->path . '/manage/' . $wildcard . '/view'] = array(
      'title' => 'Preview',
      'page callback' => 'mapboxjs_render_preset',
      'page arguments' => array($id_count+1),
      'load arguments' => array($this->entityType),
      'type' => MENU_LOCAL_TASK,
      'access callback' => 'entity_access',
      'access arguments' => array('view', $this->entityType),
    );

    return $items;
  }

}
