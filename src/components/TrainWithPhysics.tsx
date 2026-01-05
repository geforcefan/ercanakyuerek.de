import React from 'react';
import { Vector3 } from 'three';

import { CurveNode } from '../maths/curve';
import { useColors } from '../hooks/useColors';
import { useMotionSimulation } from '../hooks/useMotionSimulation';

import { ControlPoint } from './curve/ControlPoint';
import { MatrixArrowHelper } from './MatrixArrowHelper';
import { MatrixCamera } from './camera/MatrixCamera';
import { useSimulationStateControls } from '../hooks/useSimulationStateControls';

export const TrainWithPhysics = ({
  curve,
  activateCamera = false,
  init = {}
}: {
  curve: CurveNode[];
  activateCamera?: boolean;
  init?: Parameters<typeof useSimulationStateControls>[0],
}) => {
  const colors = useColors();
  const motionMatrix = useMotionSimulation(curve, init);

  return (
    <>
      {!activateCamera && (
        <group matrixAutoUpdate={false} matrix={motionMatrix}>
          <MatrixArrowHelper />
          <ControlPoint color={colors.highlight} />
        </group>
      )}
      <MatrixCamera
        matrix={motionMatrix}
        translate={new Vector3(0, 1, 0)}
        makeDefault={activateCamera}
      />
    </>
  );
};
