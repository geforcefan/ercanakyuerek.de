import React, { useMemo, useState } from 'react';
import { Line } from '@react-three/drei';
import { Vector3 } from 'three';

import { bezierSplineCurve } from '../../../../maths/bezier';
import { useColors } from '../../../../hooks/useColors';

import { CurveWireframe } from '../../../../components/curve/CurveWireframe';
import { DragControlPoints } from '../../../../components/curve/DragControlPoints';
import { TrainWithPhysics } from '../../../../components/TrainWithPhysics';
import { OrthographicScene } from '../../../../scenes/OrthographicScene';

export const BezierCurveDemoScene = () => {
  const colors = useColors();

  const [points, setPoints] = useState([
    new Vector3(-11.3, 3.9, 0),
    new Vector3(-6.6, 2.7, 0),
    new Vector3(-5.8, -3.8, 0),
    new Vector3(0, -2.4, 0),
  ]);

  const curve = useMemo(() => bezierSplineCurve(points), [points]);

  return (
    <OrthographicScene>
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
      <CurveWireframe curve={curve} />
      <TrainWithPhysics curve={curve} />
    </OrthographicScene>
  );
};
