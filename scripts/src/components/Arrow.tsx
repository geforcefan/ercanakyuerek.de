import React from 'react';
import { ThreeElements } from '@react-three/fiber';

export const Arrow = (props: { color?: number } & ThreeElements['mesh']) => {
  const { color, ...restProps } = props;

  return (
    <mesh {...restProps}>
      <coneGeometry args={[0.3, 0.5, 5]}>
        <meshStandardMaterial color={color} />
      </coneGeometry>
    </mesh>
  );
};
