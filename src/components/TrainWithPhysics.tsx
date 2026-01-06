import React from 'react';
import { Vector3 } from 'three';

import { CurveNode } from '../maths/curve';
import { useMotionSimulation } from '../hooks/useMotionSimulation';

import { MatrixCamera } from './camera/MatrixCamera';
import { useSimulationStateControls } from '../hooks/useSimulationStateControls';
import { PointWithMatrixArrows } from './PointWithMatrixArrows';

export const TrainWithPhysics = ({
  curve,
  activateCamera = false,
  init = {}
}: {
  curve: CurveNode[];
  activateCamera?: boolean;
  init?: Parameters<typeof useSimulationStateControls>[0],
}) => {
  const motionMatrix = useMotionSimulation(curve, init);

  return (
    <>
      {!activateCamera && (
        <PointWithMatrixArrows matrix={motionMatrix}/>
      )}
      <MatrixCamera
        matrix={motionMatrix}
        translate={new Vector3(0, 1, 0)}
        makeDefault={activateCamera}
      />
    </>
  );
};
