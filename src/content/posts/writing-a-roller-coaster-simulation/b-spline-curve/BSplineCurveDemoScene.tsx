import React, { useMemo, useState } from 'react';
import { Line } from '@react-three/drei';
import { Vector3, Vector4 } from 'three';

import { useColors } from '../../../../hooks/useColors';

import { CurveWireframe } from '../../../../components/curve/CurveWireframe';
import { DragControlPoints } from '../../../../components/curve/DragControlPoints';
import { Ground } from '../../../../components/Ground';
import { EditorScene } from '../../../../components/scenes/EditorScene';
import { TrainWithPhysics } from '../../../../components/TrainWithPhysics';

import { fromVertices } from '../../../../coaster/b-spline-track';

export const BSplineCurveDemoScene = () => {
  const colors = useColors();

  const [points, setPoints] = useState([
    new Vector3(0, 3, 0),
    new Vector3(10, 0, 0),
    new Vector3(12, 0, 0),
    new Vector3(15, 0, 0),
    new Vector3(17, 0, 0),
    new Vector3(18, 0, 0),
  ]);

  const curve = useMemo(
    () =>
      fromVertices(
        points.map((p) => ({
          position: new Vector4(p.x, p.y, p.z),
          strict: false,
        })),
      ),
    [points],
  );

  return (
    <EditorScene>
      <Line points={points} color={colors.highlight} />
      <DragControlPoints points={points} setPoints={setPoints} />
      <Ground />
      <CurveWireframe curve={curve} />
      <TrainWithPhysics curve={curve} />
    </EditorScene>
  );
};
