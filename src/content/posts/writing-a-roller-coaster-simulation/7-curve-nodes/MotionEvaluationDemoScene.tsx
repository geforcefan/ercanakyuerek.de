import React, { useMemo, useState } from 'react';
import { MathUtils, Vector3 } from 'three';

import {
  fromPointsBasic,
  length,
  matrixAtDistanceWithoutTransition,
} from '../../../../maths/curve';
import { useColors } from '../../../../hooks/useColors';
import { useSimulation } from '../../../../hooks/useSimulation';

import { ControlPoint } from '../../../../components/ControlPoint';
import { DragControlPoints } from '../../../../components/DragControlPoints';
import { Line } from '../../../../components/Line';
import { MatrixArrowHelper } from '../../../../components/MatrixArrowHelper';
import { OrthographicScene } from '../../../../scenes/OrthographicScene';

const MotionEvaluationDemo = () => {
  const colors = useColors();

  const [points, setPoints] = useState([
    new Vector3(-11.5, 2.5, 0),
    new Vector3(-10, -0.75, 0),
    new Vector3(-7.5, -2, 0),
    new Vector3(-5, -1, 0),
    new Vector3(-3, -1, 0),
    new Vector3(-0.5, -2.5, 0),
  ]);

  const curve = useMemo(() => fromPointsBasic(points), [points]);
  const simulationState = useSimulation(curve);

  const trainMatrix = useMemo(
    () =>
      matrixAtDistanceWithoutTransition(
        curve,
        MathUtils.clamp(
          simulationState.distanceTraveled,
          0,
          length(curve),
        ),
      ),
    [curve, simulationState.distanceTraveled],
  );

  return (
    <>
      <DragControlPoints
        axisLock="z"
        points={points}
        setPoints={setPoints}
      />
      <Line points={points} color={colors.secondary} />

      <group matrixAutoUpdate={false} matrix={trainMatrix}>
        <MatrixArrowHelper />
        <ControlPoint color={colors.highlight} />
      </group>
    </>
  );
};

export const MotionEvaluationDemoScene = () => {
  return (
    <OrthographicScene>
      <MotionEvaluationDemo />
    </OrthographicScene>
  );
};
