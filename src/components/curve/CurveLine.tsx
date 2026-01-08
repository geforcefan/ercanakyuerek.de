import React, { useMemo } from 'react';
import { Line } from '@react-three/drei';
import { LineProps } from '@react-three/drei/core/Line';

import { Curve, toPoints } from '../../maths/curve';

export const CurveLine = ({
  curve,
  ...props
}: { curve: Curve } & Omit<LineProps, 'points'>) => {
  const points = useMemo(() => toPoints(curve), [curve]);
  return <Line {...props} points={points} />;
};
