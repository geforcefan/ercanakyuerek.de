import React from 'react';
import { ThreeElements } from '@react-three/fiber';

import { useColors } from '../hooks/useColors';

import { ControlPoint } from './curve/ControlPoint';
import { MatrixArrowHelper } from './MatrixArrowHelper';

export const PointWithMatrixArrows = (
  props: ThreeElements['group'],
) => {
  const colors = useColors();

  return (
    <group matrixAutoUpdate={false} {...props}>
      <MatrixArrowHelper />
      <ControlPoint castShadow={true} color={colors.highlight} />
    </group>
  );
};
