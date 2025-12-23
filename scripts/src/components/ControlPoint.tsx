import React from 'react';
import { ThreeElements } from '@react-three/fiber';

import { useColors } from '../hooks/useColors';

type Size = 'sm' | 'md';

const sizes: Record<Size, number> = {
  sm: 0.1,
  md: 0.2,
};

export const ControlPoint = (
  props: { size?: Size; color?: number } & ThreeElements['mesh'],
) => {
  const { size = 'md', color = undefined, ...restProps } = props;

  const colors = useColors();

  return (
    <mesh {...restProps}>
      <sphereGeometry args={[sizes[size], 6, 6]} />
      <meshBasicMaterial color={color || colors.secondary} />
    </mesh>
  );
};
