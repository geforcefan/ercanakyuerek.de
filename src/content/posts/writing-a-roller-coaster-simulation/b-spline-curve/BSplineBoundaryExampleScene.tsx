import React, { useMemo, useState } from 'react';
import { Line } from '@react-three/drei';
import { useControls } from 'leva';
import { Vector3, Vector4 } from 'three';

import { fromPoints as bSplineFromPoints } from '../../../../maths/b-spline';
import { useColors } from '../../../../hooks/useColors';

import { CurveLine } from '../../../../components/curve/CurveLine';
import { DragControlPoints } from '../../../../components/curve/DragControlPoints';
import { OrthographicScene } from '../../../../components/scenes/OrthographicScene';

import { fromPoints as bSplineTrackFromPoints } from '../../../../coaster/b-spline-track';

export const BSplineBoundaryExampleScene = () => {
  const colors = useColors();

  const { boundary } = useControls({
    boundary: {
      value: 'open',
      options: ['open', 'clamped', 'closed'],
    },
  });

  const [points, setPoints] = useState([
    new Vector3(-2, 0, 0),
    new Vector3(0, 2, 0),
    new Vector3(0, 6, 0),
    new Vector3(6, 6, 0),
    new Vector3(6, 2, 0),
    new Vector3(8, 0, 0),
  ]);

  const curve = useMemo(() => {
    const vertices = points.map((p) => new Vector4(p.x, p.y, p.z));
    if (boundary === 'open') return bSplineFromPoints(vertices);
    else
      return bSplineTrackFromPoints(vertices, boundary === 'closed');
  }, [points, boundary]);

  return (
    <OrthographicScene>
      <group position={[-3, -3.5, 0]}>
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
