import React, { useMemo, useState } from 'react';
import { Line } from '@react-three/drei';
import { Vector3 } from 'three';

import { useColors } from '../../../../hooks/useColors';

import { CurveWireframe } from '../../../../components/curve/CurveWireframe';
import { DragControlPoints } from '../../../../components/curve/DragControlPoints';
import { Ground } from '../../../../components/Ground';
import { EditorScene } from '../../../../components/scenes/EditorScene';
import { TrainWithPhysics } from '../../../../components/TrainWithPhysics';

import { fromPoints } from './curve';

const wireFrameParts = [new Vector3(1, 0, 0), new Vector3(-1, 0, 0)];

export const MotionEvaluationDemoScene = () => {
  const colors = useColors();

  const [points, setPoints] = useState([
    new Vector3(-11.5, 2.5, 0),
    new Vector3(-10, -0.75, 0),
    new Vector3(-7.5, -2, 0),
    new Vector3(-5, -1, 0),
    new Vector3(-3, -1, 0),
    new Vector3(-0.5, -2.5, 0),
  ]);

  const curve = useMemo(() => fromPoints(points), [points]);

  return (
    <EditorScene>
      <DragControlPoints
        axisLock="z"
        points={points}
        setPoints={setPoints}
      />
      <CurveWireframe
        rails={wireFrameParts}
        tie={wireFrameParts}
        curve={curve}
      />
      <Line points={points} color={colors.highlight} />
      <TrainWithPhysics curve={curve} />
      <Ground position={[0, -3, 0]} />
    </EditorScene>
  );
};
