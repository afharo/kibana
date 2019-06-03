/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { connect } from 'react-redux';
import { AddLayerPanel } from './view';
import { getFlyoutDisplay, updateFlyout, FLYOUT_STATE, updateIndexingStage,
  getIndexingStage, INDEXING_STAGE } from '../../store/ui';
import { getMapColors } from '../../selectors/map_selectors';
import { getInspectorAdapters } from '../../store/non_serializable_instances';
import {
  setTransientLayer,
  addLayer,
  setSelectedLayer,
  removeTransientLayer,
} from '../../actions/store_actions';

function mapStateToProps(state = {}) {
  const indexingStage = getIndexingStage(state);
  return {
    inspectorAdapters: getInspectorAdapters(state),
    flyoutVisible: getFlyoutDisplay(state) !== FLYOUT_STATE.NONE,
    mapColors: getMapColors(state),
    isIndexingTriggered: indexingStage === INDEXING_STAGE.TRIGGERED,
    isIndexingSuccess: indexingStage === INDEXING_STAGE.SUCCESS,
    isIndexingReady: indexingStage === INDEXING_STAGE.READY,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    viewLayer: async layer => {
      await dispatch(setSelectedLayer(null));
      await dispatch(removeTransientLayer());
      dispatch(addLayer(layer.toLayerDescriptor()));
      dispatch(setSelectedLayer(layer.getId()));
      dispatch(setTransientLayer(layer.getId()));
    },
    removeTransientLayer: async () => {
      await dispatch(setSelectedLayer(null));
      await dispatch(removeTransientLayer());
    },
    selectLayerAndAdd: () => {
      dispatch(setTransientLayer(null));
      dispatch(updateFlyout(FLYOUT_STATE.LAYER_PANEL));
    },
    setIndexingTriggered: () => dispatch(updateIndexingStage(INDEXING_STAGE.TRIGGERED)),
    resetIndexing: () => dispatch(updateIndexingStage(null)),
  };
}

const connectedFlyOut = connect(mapStateToProps, mapDispatchToProps, null, { withRef: true })(AddLayerPanel);
export { connectedFlyOut as AddLayerPanel };
