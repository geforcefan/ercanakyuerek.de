import React from 'react';
import { Vector3 } from 'three';

import { Curve } from '../maths/curve';
import { useMotionSimulation } from '../hooks/useMotionSimulation';
import { useSimulationStateControls } from '../hooks/useSimulationStateControls';

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
}: {
  curve: Curve;
  activateCamera?: boolean;
  init?: Parameters<typeof useSimulationStateControls>[0];
}) => {
  const motionMatrix = useMotionSimulation(curve, init);
  const cameraViewManager = useCameraViewManager();

  return (
    <>
      {cameraViewManager.activeView !== 'train' && (
        <PointWithMatrixArrows matrix={motionMatrix} />
      )}
      <CameraView name="train" makeDefault={activateCamera}>
        <TransformationMatrixCamera
          matrix={motionMatrix}
          translate={new Vector3(0, 1, 0)}
          makeDefault={true}
        />
      </CameraView>
    </>
  );
};
