import React, { useMemo } from 'react';
import { Line } from '@react-three/drei';
import { LineProps } from '@react-three/drei/core/Line';

import { CurveNode, toPoints } from '../maths/curve';

export const CurveLine = ({
  curve,
  ...props
}: { curve: CurveNode[] } & Omit<LineProps, "points">) => {
  const points = useMemo(() => toPoints(curve), [curve]);
  return <Line {...props} points={points} />;
};
