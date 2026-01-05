import React, { useMemo, useState } from 'react';
import { Line } from '@react-three/drei';
import { useControls } from 'leva';
import { Vector3 } from 'three';

import {
  fromPoints,
  matrixAtArcLength,
  totalArcLength,
} from '../../../../maths/curve';
import { fromMatrix4 } from '../../../../maths/vector3';
import { findBoundingIndices } from '../../../../helper/binary-search';
import { useColors } from '../../../../hooks/useColors';

import { ControlPoint } from '../../../../components/curve/ControlPoint';
import { DragControlPoints } from '../../../../components/curve/DragControlPoints';
import { OrthographicScene } from '../../../../scenes/OrthographicScene';

const BinarySearchDemo = () => {
  const colors = useColors();

  const [points, setPoints] = useState([
    new Vector3(-11, -2, 0),
    new Vector3(-3, 2, 0),
    new Vector3(3, -2, 0),
    new Vector3(9, -2, 0),
  ]);

  const curve = useMemo(() => fromPoints(points), [points]);
  const curveLength = totalArcLength(curve);

  const { atArcLength } = useControls(
    {
      atArcLength: {
        min: 0 - 1,
        max: curveLength + 1,
        value: 5,
        step: 0.01,
      },
    },
    [curveLength],
  );

  const position = fromMatrix4(matrixAtArcLength(curve, atArcLength));

  const nodes = findBoundingIndices(
    curve,
    atArcLength,
    (node) => node.arcLength,
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
