import React, { useMemo } from 'react';

import { evaluate, evaluateUniform } from '../helper/bezier';
import useColors from '../hooks/useColors';
import { ControlPoint } from './ControlPoint';
import Line from './Line';

const BezierCurve = ({ points, resolution = 5, uniform = false }) => {
  const colors = useColors();

  const nodes = useMemo(() => {
    if (uniform) return evaluateUniform(points[0], points[1], points[2], points[3], resolution);
    return evaluate(points[0], points[1], points[2], points[3], resolution);
  }, [points, resolution, uniform]);

  return (
    <>
      {nodes.map((node, i) => (
        <ControlPoint size="sm" key={i} position={node.position} />
      ))}

      <Line points={points} color={colors.silent} lineWidth={0.01} />
      {!!nodes.length && (
        <Line
          points={nodes.map((node) => node.position)}
          color={colors.secondary}
          lineWidth={0.02}
        />
      )}
    </>
  );
};

export default BezierCurve;
