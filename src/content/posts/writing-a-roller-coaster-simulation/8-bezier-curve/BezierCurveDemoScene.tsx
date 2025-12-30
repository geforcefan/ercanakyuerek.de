import React, { useMemo, useState } from 'react';
import { Line } from '@react-three/drei';
import { Vector3 } from 'three';

import { useColors } from '../../../../hooks/useColors';
import { useMotionSimulation } from '../../../../hooks/useMotionSimulation';

import { CurveLine } from '../../../../components/CurveLine';
import { DragControlPoints } from '../../../../components/DragControlPoints';
import { PointWithMatrixArrows } from '../../../../components/PointWithMatrixArrows';
import { OrthographicScene } from '../../../../scenes/OrthographicScene';
import { bezierSplineCurve } from '../../../../maths/bezier';

const BezierCurveDemo = () => {
  const colors = useColors();

  const [points, setPoints] = useState([
    new Vector3(-11.3, 3.9, 0),
    new Vector3(-6.6, 2.7, 0),
    new Vector3(-5.8, -3.8, 0),
    new Vector3(0, -2.4, 0),
  ]);

  const curve = useMemo(
    () => bezierSplineCurve(points),
    [points],
  );

  const motionMatrix = useMotionSimulation(curve);

  return (
    <>
      <Line
        points={points}
        color={colors.highlight}
        segments={true}
      />

      <DragControlPoints
        axisLock="z"
        points={points}
        setPoints={setPoints}
      />

      <PointWithMatrixArrows matrix={motionMatrix} />
      <CurveLine curve={curve} color={colors.secondary} />
    </>
  );
};

export const BezierCurveDemoScene = () => {
  return (
    <OrthographicScene>
      <BezierCurveDemo />
    </OrthographicScene>
  );
};
