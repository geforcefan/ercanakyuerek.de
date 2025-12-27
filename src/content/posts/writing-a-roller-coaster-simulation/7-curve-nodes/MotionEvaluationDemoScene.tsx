import React, { useMemo, useState } from 'react';
import { Line } from '@react-three/drei';
import { Vector3 } from 'three';

import { fromPointsBasic } from '../../../../maths/curve';
import { useColors } from '../../../../hooks/useColors';
import { useSimulationMotion } from '../../../../hooks/useSimulationMotion';

import { ControlPoint } from '../../../../components/ControlPoint';
import { DragControlPoints } from '../../../../components/DragControlPoints';
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
  const motionMatrix = useSimulationMotion(curve);

  return (
    <>
      <DragControlPoints
        axisLock="z"
        points={points}
        setPoints={setPoints}
      />
      <Line points={points} color={colors.secondary} />

      <group matrixAutoUpdate={false} matrix={motionMatrix}>
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
