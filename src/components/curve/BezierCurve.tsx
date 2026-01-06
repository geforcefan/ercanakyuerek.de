import React, { useMemo } from 'react';
import { Line } from '@react-three/drei';
import { Vector3 } from 'three';

import { bezierSplineCurve } from '../../maths/bezier';
import { totalArcLength, matrixAtArcLength } from '../../maths/curve';
import { uniformSampleMap } from '../../helper/uniform-sample';
import { useColors } from '../../hooks/useColors';

import { ControlPoint } from './ControlPoint';
import { toPosition } from '../../maths/matrix4';

export const BezierCurve = (props: {
  points: Vector3[];
  resolution?: number;
  uniform?: boolean;
  showNodes?: boolean;
  color?: number;
}) => {
  const {
    points,
    resolution = 20,
    uniform = false,
    showNodes = false,
    color
  } = props;

  const colors = useColors();

  const nodes = useMemo(() => {
    const curve = bezierSplineCurve(points, resolution);

    const parametricNodes = curve.map((node) =>
      toPosition(node.matrix),
    );

    const uniformNodes = uniformSampleMap(
      0,
      totalArcLength(curve),
      resolution,
      (at) => toPosition(matrixAtArcLength(curve, at)),
    );

    return uniform ? uniformNodes : parametricNodes;
  }, [points, resolution, uniform]);

  return (
    <>
      {showNodes &&
        nodes.map((position, i) => (
          <ControlPoint size="sm" key={i} position={position} />
        ))}

      {!!nodes.length && (
        <Line points={nodes} color={color || colors.secondary} />
      )}
    </>
  );
};
