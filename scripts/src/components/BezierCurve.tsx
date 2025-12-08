import React, { useMemo } from 'react';
import { Vector3 } from 'three';

import { evaluate, evaluateUniform } from '../helper/bezier';
import useColors from '../hooks/useColors';
import { ControlPoint } from './ControlPoint';
import Line from './Line';

const BezierCurve = (props: { points: Vector3[]; resolution?: number; uniform?: boolean }) => {
  const { points, resolution = 5, uniform = false } = props;

  const colors = useColors();

  const nodes = useMemo(() => {
    if (uniform) return evaluateUniform(points[0], points[1], points[2], points[3], resolution);
    return evaluate(points[0], points[1], points[2], points[3], resolution);
  }, [points, resolution, uniform]);

  const positions = useMemo(
    () => nodes.map((node) => new Vector3().setFromMatrixPosition(node.matrix)),
    [nodes],
  );

  return (
    <>
      {positions.map((position, i) => (
        <ControlPoint size="sm" key={i} position={position} />
      ))}

      {!!positions.length && <Line points={positions} color={colors.secondary} />}
    </>
  );
};

export default BezierCurve;
