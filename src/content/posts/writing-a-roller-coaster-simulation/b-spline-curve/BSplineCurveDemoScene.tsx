import React, { useMemo, useState } from 'react';
import { Line } from '@react-three/drei';
import { useControls } from 'leva';
import { Vector3, Vector4 } from 'three';

import { useColors } from '../../../../hooks/useColors';

import { CurveTrackMesh } from '../../../../components/curve/CurveTrackMesh';
import { DragControlPoints } from '../../../../components/curve/DragControlPoints';
import { Ground } from '../../../../components/Ground';
import { EditorScene } from '../../../../components/scenes/EditorScene';
import { TrainWithPhysics } from '../../../../components/TrainWithPhysics';

import { fromPoints } from '../../../../coaster/b-spline-track';

export const BSplineCurveDemoScene = () => {
  const colors = useColors();

  const [{ closed }] = useControls(() => ({ closed: false }));

  const [points, setPoints] = useState([
    new Vector3(-10, 8, 0),
    new Vector3(-6, -8, 0),
    new Vector3(1, -6, 0),
    new Vector3(6, -8, 0),
    new Vector3(10, -7, 0),
  ]);

  const curve = useMemo(
    () =>
      fromPoints(
        points.map((p) => new Vector4(p.x, p.y, p.z)),
        closed,
      ),
    [points, closed],
  );

  return (
    <EditorScene>
      <Line points={points} color={colors.highlight} />
      <DragControlPoints points={points} setPoints={setPoints} />
      <Ground position={[0, -10, 0]} />
      <CurveTrackMesh curve={curve} />
      <TrainWithPhysics
        curve={curve}
        resetWhenReachedLimit={!closed}
      />
    </EditorScene>
  );
};
