import React, { useMemo, useState } from 'react';
import { Vector3 } from 'three';

import { CurveLine } from '../../../../components/curve/CurveLine';
import { DragControlPoints } from '../../../../components/curve/DragControlPoints';
import { Ground } from '../../../../components/Ground';
import { EditorScene } from '../../../../components/scenes/EditorScene';
import { TrainWithPhysics } from '../../../../components/TrainWithPhysics';

import { fromPoints } from './curve';

export const MotionEvaluationDemoScene = () => {
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
      <CurveLine curve={curve} />
      <TrainWithPhysics curve={curve} />
      <Ground position={[0, -3, 0]} />
    </EditorScene>
  );
};
