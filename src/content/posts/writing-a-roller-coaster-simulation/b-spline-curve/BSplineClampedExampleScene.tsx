import React, { useMemo, useState } from 'react';
import { Line } from '@react-three/drei';
import { Vector3, Vector4 } from 'three';

import { fromPoints } from '../../../../maths/b-spline';
import { useColors } from '../../../../hooks/useColors';

import { CurveLine } from '../../../../components/curve/CurveLine';
import { DragControlPoints } from '../../../../components/curve/DragControlPoints';
import { OrthographicScene } from '../../../../components/scenes/OrthographicScene';

export const BSplineClampedExampleScene = () => {
  const colors = useColors();

  const [points, setPoints] = useState([
    new Vector3(2, 0, 0),
    new Vector3(0, 2, 0),
    new Vector3(0, 6, 0),
    new Vector3(6, 6, 0),
    new Vector3(6, 2, 0),
    new Vector3(4, 0, 0),
  ]);

  const curve = useMemo(
    () =>
      fromPoints(
        points.map((p) => new Vector4(p.x, p.y, p.z)),
        'clamped',
      ),
    [points],
  );

  return (
    <OrthographicScene>
      <group position={[-3, -2, 0]}>
        <Line points={points} color={colors.highlight} />
        <DragControlPoints
          axisLock="z"
          points={points}
          setPoints={setPoints}
        />
        <CurveLine curve={curve} />
      </group>
    </OrthographicScene>
  );
};
