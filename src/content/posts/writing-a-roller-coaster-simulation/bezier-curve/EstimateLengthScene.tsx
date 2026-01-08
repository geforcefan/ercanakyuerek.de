import React, { useMemo, useState } from 'react';
import { Line } from '@react-three/drei';
import { useControls } from 'leva';
import { Vector3 } from 'three';

import { deCasteljau } from '../../../../maths/bezier';
import { uniformSampleMap } from '../../../../helper/uniform-sample';
import { useColors } from '../../../../hooks/useColors';

import { BezierCurve } from '../../../../components/curve/BezierCurve';
import { DragControlPoints } from '../../../../components/curve/DragControlPoints';
import { OrthographicScene } from '../../../../scenes/OrthographicScene';

export const EstimateLengthScene = () => {
  const colors = useColors();

  const [state] = useControls(() => ({
    numberOfNodes: {
      min: 2,
      max: 16,
      step: 1,
      value: 8,
    },
  }));

  const [points, setPoints] = useState([
    new Vector3(-4.5, -6, 0),
    new Vector3(-4.5, 2.8, 0),
    new Vector3(4.5, 2.8, 0),
    new Vector3(4.5, -6, 0),
  ]);

  const positions = useMemo(
    () =>
      uniformSampleMap(0, state.numberOfNodes, 1, (at, t) =>
        deCasteljau(points, t),
      ),
    [state.numberOfNodes, points],
  );

  return (
    <OrthographicScene>
      <Line points={positions} />
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
      <BezierCurve points={points} color={colors.highlight} />
    </OrthographicScene>
  );
};
