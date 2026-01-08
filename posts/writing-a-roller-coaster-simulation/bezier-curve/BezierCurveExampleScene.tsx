import React, { useState } from 'react';
import { Line } from '@react-three/drei';
import { Vector3 } from 'three';

import { useColors } from '../../../../hooks/useColors';

import { BezierCurve } from '../../../../components/curve/BezierCurve';
import { DragControlPoints } from '../../../../components/curve/DragControlPoints';
import { OrthographicScene } from '../../../../scenes/OrthographicScene';

export const BezierCurveExampleScene = () => {
  const colors = useColors();

  const [points, setPoints] = useState([
    new Vector3(-3, -3, 0),
    new Vector3(3, -3, 0),
    new Vector3(-3, 3, 0),
    new Vector3(3, 3, 0),
  ]);

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
      <BezierCurve points={points} />
    </OrthographicScene>
  );
};
