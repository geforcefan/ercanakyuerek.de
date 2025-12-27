import React, { useMemo, useState } from 'react';
import { Line } from '@react-three/drei';
import last from 'lodash/last';
import { Matrix4, Vector3 } from 'three';

import { CurveNode } from '../../../../maths/curve';
import { useColors } from '../../../../hooks/useColors';
import { useMotionSimulation } from '../../../../hooks/useMotionSimulation';

import { DragControlPoints } from '../../../../components/DragControlPoints';
import { OrthographicScene } from '../../../../scenes/OrthographicScene';
import { PointWithMatrixArrows } from '../../../../components/PointWithMatrixArrows';

const curveFromPoints = (points: Vector3[]) => {
  const curve: CurveNode[] = [];
  if (points.length < 2) return curve;

  let distanceAtCurve = 0;

  for (let i = 0; i < points.length - 1; i++) {
    const left = points[i];
    const right = points[i + 1];
    const prevNode = curve[curve.length - 1];

    if (prevNode)
      curve.push({
        matrix: prevNode.matrix.clone().setPosition(left),
        distanceAtCurve,
      });

    curve.push({
      matrix: new Matrix4()
        .lookAt(right, left, new Vector3(0, 1, 0))
        .setPosition(left),
      distanceAtCurve,
    });

    distanceAtCurve += left.distanceTo(right);
  }

  const lastNode = last(curve)!;
  const lastPoint = last(points)!;

  curve.push({
    matrix: lastNode.matrix.clone().setPosition(lastPoint),
    distanceAtCurve,
  });

  return curve;
};

const MotionEvaluationDemo = () => {
  const colors = useColors();

  const [points, setPoints] = useState([
    new Vector3(-11.5, 2.5, 0),
    new Vector3(-10, -0.75, 0),
    new Vector3(-7.5, -2, 0),
    new Vector3(-5, -1, 0),
    new Vector3(-3, -1, 0),
    new Vector3(-0.5, -2.5, 0),
  ]);

  const curve = useMemo(() => curveFromPoints(points), [points]);
  const motionMatrix = useMotionSimulation(curve);

  return (
    <>
      <DragControlPoints
        axisLock="z"
        points={points}
        setPoints={setPoints}
      />
      <Line points={points} color={colors.secondary} />
      <PointWithMatrixArrows matrix={motionMatrix}/>
    </>
  );
};

export const MotionEvaluationDemoScene = () => {
  return (
    <OrthographicScene>
      <MotionEvaluationDemo />
    </OrthographicScene>
  );
};
