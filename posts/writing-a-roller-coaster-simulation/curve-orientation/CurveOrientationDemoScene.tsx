import React, { useMemo, useState } from 'react';
import { Line } from '@react-three/drei';
import { Vector3 } from 'three';

import { bezierSplineCurve } from '../../../../maths/bezier';
import { useColors } from '../../../../hooks/useColors';

import { CurveTrackMesh } from '../../../../components/curve/CurveTrackMesh';
import { DragControlPoints } from '../../../../components/curve/DragControlPoints';
import { Ground } from '../../../../components/Ground';
import { EditorScene } from '../../../../components/scenes/EditorScene';
import { TrainWithPhysics } from '../../../../components/TrainWithPhysics';

export const CurveOrientationDemoScene = () => {
  const colors = useColors();

  const [points, setPoints] = useState([
    new Vector3(0, 0, 0),
    new Vector3(12, -5, 0),
    new Vector3(12, 15, 0),
    new Vector3(0, 10, 0),
  ]);

  const curve = useMemo(() => bezierSplineCurve(points), [points]);

  return (
    <EditorScene>
      <group position={[-11, -5, -10]}>
        <Line
          points={points}
          color={colors.highlight}
          segments={true}
        />
        <DragControlPoints points={points} setPoints={setPoints} />
        <CurveTrackMesh curve={curve} />
        <TrainWithPhysics curve={curve} init={{ velocity: 17 }} />
      </group>
      <group position={[0, -10, 0]}>
        <Ground />
      </group>
    </EditorScene>
  );
};
