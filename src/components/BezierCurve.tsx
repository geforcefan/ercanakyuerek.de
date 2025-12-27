import React, { useMemo } from 'react';
import { Line } from '@react-three/drei';
import { Vector3 } from 'three';

import { bezierSplineCurve } from '../maths/bezier';
import { length, matrixAtDistance } from '../maths/curve';
import { fromMatrix4 } from '../maths/vector3';
import { uniformSampleMap } from '../helper/uniform-sample';
import { useColors } from '../hooks/useColors';

import { ControlPoint } from './ControlPoint';

export const BezierCurve = (props: {
  points: Vector3[];
  resolution?: number;
  uniform?: boolean;
  showNodes?: boolean;
}) => {
  const {
    points,
    resolution = 5,
    uniform = false,
    showNodes = false,
  } = props;

  const colors = useColors();

  const nodes = useMemo(() => {
    const curve = bezierSplineCurve(
      points[0],
      points[1],
      points[2],
      points[3],
      resolution,
    );

    const parametricNodes = curve.map((node) =>
      fromMatrix4(node.matrix),
    );

    const uniformNodes = uniformSampleMap(
      0,
      length(curve),
      resolution,
      (at) => fromMatrix4(matrixAtDistance(curve, at)),
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
        <Line points={nodes} color={colors.secondary} />
      )}
    </>
  );
};
