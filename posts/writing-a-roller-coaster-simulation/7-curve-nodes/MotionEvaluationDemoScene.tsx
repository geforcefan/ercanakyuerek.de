import React, { useMemo, useState } from 'react';
import { Line } from '@react-three/drei';
import { Vector3 } from 'three';

import { fromPointsWithBasicNormals } from '../../../../maths/curve';
import { useColors } from '../../../../hooks/useColors';
import { useMotionSimulation } from '../../../../hooks/useMotionSimulation';

import { DragControlPoints } from '../../../../components/DragControlPoints';
import { PointWithMatrixArrows } from '../../../../components/PointWithMatrixArrows';
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

  const curve = useMemo(
    () => fromPointsWithBasicNormals(points),
    [points],
  );
  const motionMatrix = useMotionSimulation(curve);

  return (
    <>
      <DragControlPoints
        axisLock="z"
        points={points}
        setPoints={setPoints}
      />
      <Line points={points} color={colors.secondary} />
      <PointWithMatrixArrows matrix={motionMatrix} />
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
