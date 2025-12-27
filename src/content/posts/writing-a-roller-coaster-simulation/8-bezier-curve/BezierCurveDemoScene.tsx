import React, { useMemo, useState } from 'react';
import { Line } from '@react-three/drei';
import { Vector3 } from 'three';

import { bezierSplineCurve } from '../../../../maths/bezier';
import { useColors } from '../../../../hooks/useColors';
import { useSimulationMotion } from '../../../../hooks/useSimulationMotion';

import { ControlPoint } from '../../../../components/ControlPoint';
import { CurveLine } from '../../../../components/CurveLine';
import { DragControlPoints } from '../../../../components/DragControlPoints';
import { MatrixArrowHelper } from '../../../../components/MatrixArrowHelper';
import { OrthographicScene } from '../../../../scenes/OrthographicScene';

const BezierCurveDemo = () => {
  const colors = useColors();

  const [points, setPoints] = useState([
    new Vector3(-11.3, 3.9, 0),
    new Vector3(-6.6, 2.7, 0),
    new Vector3(-5.8, -3.8, 0),
    new Vector3(1.6, -2.4, 0),
  ]);

  const curve = useMemo(
    () =>
      bezierSplineCurve(
        points[0],
        points[1],
        points[2],
        points[3],
        10,
      ),
    [points],
  );

  const motionMatrix = useSimulationMotion(curve);

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

      <group matrixAutoUpdate={false} matrix={motionMatrix}>
        <MatrixArrowHelper />
        <ControlPoint color={colors.highlight} />
      </group>

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
