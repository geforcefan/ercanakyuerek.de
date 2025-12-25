import React, { useMemo, useState } from 'react';
import { useControls } from 'leva';
import { Vector3 } from 'three';

import {
  fromPoints,
  length,
  matrixAtDistance,
} from '../../../../maths/curve';
import { fromMatrix4 } from '../../../../maths/vector3';
import { findBoundingIndices } from '../../../../helper/binary-search';
import { useColors } from '../../../../hooks/useColors';

import { ControlPoint } from '../../../../components/ControlPoint';
import { DragControlPoints } from '../../../../components/DragControlPoints';
import { Line } from '../../../../components/Line';
import { OrthographicScene } from '../../../../scenes/OrthographicScene';

const BinarySearchDemo = () => {
  const colors = useColors();

  const [points, setPoints] = useState([
    new Vector3(-10, -2, 0),
    new Vector3(-2, 2, 0),
    new Vector3(4, -2, 0),
    new Vector3(10, -2, 0),
  ]);

  const curve = useMemo(() => fromPoints(points), [points]);
  const curveLength = length(curve);

  const { distance } = useControls(
    {
      distance: {
        min: 0 - 1,
        max: curveLength + 1,
        value: 5,
        step: 0.01,
      },
    },
    [curveLength],
  );

  const position = fromMatrix4(matrixAtDistance(curve, distance));

  const nodes = findBoundingIndices(
    curve,
    distance,
    (node) => node.distanceAtCurve,
  )?.map((index) => fromMatrix4(curve[index].matrix));

  return (
    <>
      <DragControlPoints
        axisLock="z"
        points={points}
        setPoints={setPoints}
      />

      {[position, ...(nodes || [])].map((position) => (
        <ControlPoint color={colors.highlight} position={position} />
      ))}

      <Line points={points} color={colors.secondary} />
    </>
  );
};

export const MotionEvaluationDemoScene = () => {
  return (
    <OrthographicScene>
      <BinarySearchDemo />
    </OrthographicScene>
  );
};
