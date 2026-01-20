import React, { useMemo, useState } from 'react';
import { Line } from '@react-three/drei';
import { useControls } from 'leva';
import { Vector3, Vector4 } from 'three';

import { toLocalTransformed } from '../../../../maths/curve';
import { useColors } from '../../../../hooks/useColors';

import { CurveWireframe } from '../../../../components/curve/CurveWireframe';
import { DragControlPoints } from '../../../../components/curve/DragControlPoints';
import { Ground } from '../../../../components/Ground';
import { EditorScene } from '../../../../components/scenes/EditorScene';
import { TrainWithPhysics } from '../../../../components/TrainWithPhysics';

import { fromVertices as bSplineFromVertices } from '../../../../coaster/b-spline-track';
import { fromVertices } from '../../../../coaster/nolimits-track';

export const BSplineCurveDemoScene = ({ pov }: { pov?: boolean }) => {
  const colors = useColors();

  const [points, setPoints] = useState([
    new Vector3(0, 3, 0),
    new Vector3(10, 0, 0),
    new Vector3(12, 0, 0),
    new Vector3(15, 0, 0),
    new Vector3(17, 0, 0),
    new Vector3(18, 0, 0),
  ]);

  const { closed, nurbs } = useControls({
    closed: false,
    nurbs: false,
    pov: false,
  });

  const curve = useMemo(() => {
    if (nurbs)
      return fromVertices(
        points.map((p) => ({
          position: new Vector4(p.x, p.y, p.z, 1),
          strict: false,
        })),
        closed,
      );
    else
      return bSplineFromVertices(
        points.map((p) => ({
          position: new Vector4(p.x, p.y, p.z, 0.1),
          strict: false,
        })),
        closed,
      );
  }, [points, closed, nurbs]);

  const heartlineCurve = useMemo(
    () => toLocalTransformed(curve, new Vector3(0, -1.1, 0)),
    [curve],
  );

  return (
    <EditorScene>
      <Line points={points} color={colors.highlight} />
      <DragControlPoints points={points} setPoints={setPoints} />
      <Ground />
      <CurveWireframe curve={heartlineCurve} />
      <TrainWithPhysics curve={heartlineCurve} activateCamera={pov} />
    </EditorScene>
  );
};
