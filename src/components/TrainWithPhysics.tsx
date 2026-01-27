import React from 'react';
import { Vector3 } from 'three';

import { Curve } from '../maths/curve';
import { useMotionSimulation } from '../hooks/useMotionSimulation';

import {
  CameraView,
  useCameraViewManager,
} from './camera/CameraViewManager';
import { TransformationMatrixCamera } from './camera/TransformationMatrixCamera';
import { PointWithMatrixArrows } from './PointWithMatrixArrows';

export const TrainWithPhysics = ({
  curve,
  init = {},
  activateCamera = false,
  resetWhenReachedLimit = true,
  sections = [],
}: {
  curve: Curve;
  activateCamera?: boolean;
} & Parameters<typeof useMotionSimulation>[1]) => {
  const motionMatrix = useMotionSimulation(curve, {
    init,
    resetWhenReachedLimit,
    sections,
  });
  const cameraViewManager = useCameraViewManager();

  return (
    <>
      {cameraViewManager.activeView !== 'train' && (
        <PointWithMatrixArrows matrix={motionMatrix} />
      )}
      <CameraView name="train" makeDefault={activateCamera}>
        <TransformationMatrixCamera
          matrix={motionMatrix}
          translate={new Vector3(0, 0.75, 0)}
          makeDefault={true}
        />
      </CameraView>
    </>
  );
};
