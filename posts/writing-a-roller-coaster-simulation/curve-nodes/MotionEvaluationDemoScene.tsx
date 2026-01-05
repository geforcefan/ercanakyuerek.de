import React, { useMemo, useState } from 'react';
import { Vector3 } from 'three';

import { fromPointsWithBasicNormals } from '../../../../maths/curve';

import { DragControlPoints } from '../../../../components/curve/DragControlPoints';
import { TrainWithPhysics } from '../../../../components/TrainWithPhysics';
import { OrthographicScene } from '../../../../scenes/OrthographicScene';
import { CurveLine } from '../../../../components/curve/CurveLine';

export const MotionEvaluationDemoScene = () => {
  const [points, setPoints] = useState([
    new Vector3(-11.5, 2.5, 0),
    new Vector3(-10, -0.75, 0),
    new Vector3(-7.5, -2, 0),
    new Vector3(-5, -1, 0),
    new Vector3(-3, -1, 0),
    new Vector3(-0.5, -2.5, 0),
  ]);

  const curve = useMemo(
    () => fromPointsWithBasicNormals(points),
    [points],
  );

  return (
    <OrthographicScene>
      <DragControlPoints
        axisLock="z"
        points={points}
        setPoints={setPoints}
      />
      <CurveLine curve={curve} />
      <TrainWithPhysics curve={curve} />
    </OrthographicScene>
  );
};
